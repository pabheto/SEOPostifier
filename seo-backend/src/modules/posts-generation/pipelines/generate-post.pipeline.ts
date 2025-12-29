import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import cleanWebContent from 'src/library/parsing/clean-webpage-text.util';
import { executeWithRateLimit } from 'src/library/rate-limit.util';
import {
  AspectRatio,
  NanoBananaImageGenerationService,
} from 'src/modules/image-generation/services/nano-banana-image-generation.service';
import {
  AnthropicModel,
  AntrophicService,
} from 'src/modules/llm-manager/antrophic.service';
import { ExaService } from 'src/modules/llm-manager/exa.service';
import { GroqModel, GroqService } from 'src/modules/llm-manager/groq.service';
import {
  OpenaiModel,
  OpenaiService,
} from 'src/modules/llm-manager/openai.service';
import { ScriptFormatDefinition } from 'src/modules/posts-management/library/interfaces/post-interview.interface';
import {
  PostBlock,
  PostBlockType,
  PostStatus,
} from 'src/modules/posts-management/library/interfaces/posts.interface';
import { PostInterviewsRepository } from 'src/modules/posts-management/repositories/post-interviews.repository';
import { PostsRepository } from 'src/modules/posts-management/repositories/posts.repository';
import { PostInterview } from 'src/modules/posts-management/schemas/post-interview.schema';
import { Post } from 'src/modules/posts-management/schemas/posts.schema';
import { RedisStorageService } from 'src/modules/storage';
import { buildPipelineId } from '../library/interfaces/pipelines/pipeline-ids.util';
import {
  AvailablePipelines,
  BasePipelineContext,
  BasePipelineStep,
  Pipeline,
  PipelineStepOutcome,
} from '../library/interfaces/pipelines/pipeline.interface';
import {
  SERP_ResearchPlan,
  SERP_SearchResult,
} from '../library/interfaces/serp.interfaces';
import { FormattingPrompts } from '../library/prompting/formatting.prompts';
import { PostGenerationPrompts } from '../library/prompting/post-generation.prompts';
import {
  ResearchPrompts,
  RESPONSE_SummarizeSERP_SearchResults,
} from '../library/prompting/research.prompts';
import { ScriptGenerationPrompts } from '../library/prompting/script-generation.prompts';

export enum GeneratePostPipelineStep {
  CREATE_SERP_RESEARCH_PLAN = 'CREATE_SERP_RESEARCH_PLAN',
  GATHER_AND_SUMMARIZE_EXA_RESEARCH_RESULTS = 'GATHER_AND_SUMMARIZE_EXA_RESEARCH_RESULTS',
  OPTIMIZE_SERP_SEARCH_RESULTS = 'OPTIMIZE_SERP_SEARCH_RESULTS',
  CREATE_SCRIPT_DRAFT = 'CREATE_SCRIPT_DRAFT',
  OPTIMIZE_SCRIPT_DRAFT = 'OPTIMIZE_SCRIPT_DRAFT',
  CREATE_POST_SCRIPT_DEFINITION = 'CREATE_POST_SCRIPT_DEFINITION',
  GENERATE_POST_PARTS = 'GENERATE_POST_PARTS',
}

export type GeneratePostPipeline_Step =
  | BasePipelineStep
  | GeneratePostPipelineStep;

export type GeneratePostPipeline_Context =
  BasePipelineContext<GeneratePostPipeline_Step> & {
    postInterview: PostInterview;
    post?: Post;
    serpResearchPlan?: SERP_ResearchPlan;
    serpKnowledgeBase?: RESPONSE_SummarizeSERP_SearchResults;
  };

// Each pipeline step receives context and returns context
@Injectable()
export class GeneratePost_Pipeline extends Pipeline<GeneratePostPipeline_Context> {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly exaService: ExaService,
    private readonly antrophicService: AntrophicService,
    private readonly groqService: GroqService,
    private readonly imageGenerationService: NanoBananaImageGenerationService,
    private readonly postInterviewsRepository: PostInterviewsRepository,
    private readonly postsRepository: PostsRepository,
    redisStorageService: RedisStorageService,
  ) {
    super(redisStorageService, AvailablePipelines.GENERATE_POST_PIPELINE);
  }

  async initialize(postInterview: PostInterview) {
    const pipelineId = buildPipelineId(
      AvailablePipelines.GENERATE_POST_PIPELINE,
      postInterview.interviewId,
    );
    await this.updateContext(pipelineId, {
      pipelineType: AvailablePipelines.GENERATE_POST_PIPELINE,
      pipelineId,
      startedAt: new Date(),
      step: BasePipelineStep.INIT,
      postInterview,
    });

    return pipelineId;
  }

  async STEP_generateResearchPlanForSerpQueries(
    context: GeneratePostPipeline_Context,
  ) {
    const { postInterview } = context;
    const researchPlanForSerpQueriesPrompt =
      ResearchPrompts.PROMPT_CreateResearchPlanForSerpQueries(postInterview);

    // Using OpenAI GPT 5.2 mini
    const researchPlanForSerpQueriesResult = await this.openaiService.generate(
      researchPlanForSerpQueriesPrompt,
      {
        model: OpenaiModel.GPT_52_MINI,
        maxTokens: 8092,
      },
    );

    // TODO: Implement fallbacks here
    const parsedResult = JSON.parse(
      researchPlanForSerpQueriesResult.content,
    ) as SERP_ResearchPlan;

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      serpResearchPlan: parsedResult,
    };

    return updatedContext;
  }

  async STEP_gatherAndSummarizeExaResearchResults(
    context: GeneratePostPipeline_Context,
  ) {
    const { serpResearchPlan } = context;

    if (!serpResearchPlan) {
      throw new BadRequestException('SERP research plan not found');
    }

    const exaResearchResults = await executeWithRateLimit(
      serpResearchPlan.researchQueries,
      async (query) => {
        const exaResults = await this.exaService.search({
          query: query.query,
          numResults: 2,
        });

        const searchResults: SERP_SearchResult[] = exaResults.results.map(
          (result) => ({
            url: result.url ?? '',
            title: result.title ?? '',
            author: result.author ?? '',
            content: result.text,
            searchIntentQuery: query.query,
          }),
        );

        return {
          query,
          searchResults,
        };
      },
      3, // Limit to 3 requests per second to stay within EXA rate limits
    );

    const cleanedExaResearchResults: SERP_SearchResult[] = [];
    // Clean each individual search result so batching uses per-URL content
    for (const { searchResults } of exaResearchResults) {
      for (const searchResult of searchResults) {
        cleanedExaResearchResults.push({
          ...searchResult,
          content: cleanWebContent(searchResult.content),
        });
      }
    }

    // Sort results by content length (shortest first) for better batching
    cleanedExaResearchResults.sort(
      (a, b) => a.content.length - b.content.length,
    );

    // Batching if web content in short, maximum, 10k chars per batch
    const batchedExaResearchResults: SERP_SearchResult[][] = [];
    let currentBatch: SERP_SearchResult[] = [];
    let currentBatchLength = 0;

    for (const result of cleanedExaResearchResults) {
      const resultContentLength = result.content.length;

      // If adding this result would exceed 10k chars, start a new batch
      if (
        currentBatchLength + resultContentLength > 10000 &&
        currentBatch.length > 0
      ) {
        batchedExaResearchResults.push(currentBatch);
        currentBatch = [result];
        currentBatchLength = resultContentLength;
      } else {
        currentBatch.push(result);
        currentBatchLength += resultContentLength;
      }
    }

    // Add the last batch if it has content
    if (currentBatch.length > 0) {
      batchedExaResearchResults.push(currentBatch);
    }

    // Process each batch in parallel
    const batchPromises = batchedExaResearchResults.map(async (batch) => {
      const summarizeExaResearchResultsPrompt =
        ResearchPrompts.PROMPT_SummarizeSERP_SearchResults(batch);
      const summaryResponse = await this.openaiService.generate(
        summarizeExaResearchResultsPrompt,
        {
          model: OpenaiModel.GPT_52_MINI,
          maxTokens: 8096,
        },
      );

      // TODO: Implement fallbacks
      const parsedSummaryResponse = JSON.parse(
        summaryResponse.content,
      ) as RESPONSE_SummarizeSERP_SearchResults;
      return parsedSummaryResponse;
    });

    const batchResults = await Promise.all(batchPromises);
    const summarizedSERPResults: RESPONSE_SummarizeSERP_SearchResults = [];

    for (const batchResult of batchResults) {
      summarizedSERPResults.push(...batchResult);
    }

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      serpKnowledgeBase: summarizedSERPResults,
    };

    return updatedContext;
  }

  async STEP_optimizeSERP_SearchResults(context: GeneratePostPipeline_Context) {
    const { serpKnowledgeBase } = context;

    if (!serpKnowledgeBase) {
      throw new BadRequestException('SERP knowledge base not found');
    }

    const optimizeSERP_SearchResultsPrompt =
      ResearchPrompts.PROMPT_OptimizeSERP_SearchResults(serpKnowledgeBase);
    const optimizeSERP_SearchResultsResult = await this.groqService.generate(
      optimizeSERP_SearchResultsPrompt,
      {
        model: GroqModel.GPT_OSS_120B_MODEL,
        maxTokens: 8096,
      },
    );

    // TODO: Implement fallbacks
    const parsedOptimizeSERP_SearchResultsResult = JSON.parse(
      optimizeSERP_SearchResultsResult.content,
    ) as RESPONSE_SummarizeSERP_SearchResults;

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      serpKnowledgeBase: parsedOptimizeSERP_SearchResultsResult,
    };

    return updatedContext;
  }

  async STEP_createScriptDraft(
    context: GeneratePostPipeline_Context,
  ): Promise<GeneratePostPipeline_Context> {
    const { postInterview, serpKnowledgeBase } = context;

    if (!serpKnowledgeBase) {
      throw new BadRequestException('SERP knowledge base not found');
    }

    const createScriptDraftPrompt =
      ScriptGenerationPrompts.GENERATE_SEO_POST_SCRIPT_BASE_PROMPT({
        postInterview,
        summarizedSERPKnowledgeBase: serpKnowledgeBase,
      });
    const createScriptDraftResult = await this.antrophicService.generate(
      createScriptDraftPrompt,
      {
        model: AnthropicModel.CLAUDE_SONNET_4_5,
        maxTokens: 20480,
      },
    );

    postInterview.generatedScriptText = createScriptDraftResult.content;

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      postInterview,
    };

    return updatedContext;
  }

  async STEP_optimizeScriptDraft(
    context: GeneratePostPipeline_Context,
  ): Promise<GeneratePostPipeline_Context> {
    const { postInterview, serpKnowledgeBase } = context;
    const scriptText = context.postInterview.generatedScriptText;

    if (!serpKnowledgeBase) {
      throw new BadRequestException('SERP knowledge base not found');
    }

    if (!scriptText) {
      throw new BadRequestException('Script text not found');
    }

    const optimizeScriptDraftPrompt =
      ScriptGenerationPrompts.OPTIMIZE_SEO_SCRIPT_WORD_LENGTH_LINKS_AND_IMAGES_PROMPT(
        {
          postInterview,
          serpKnowledgeBase,
          scriptText,
        },
      );
    const optimizeScriptDraftResult = await this.antrophicService.generate(
      optimizeScriptDraftPrompt,
      {
        model: AnthropicModel.CLAUDE_SONNET_4_5,
        maxTokens: 20480,
      },
    );

    postInterview.generatedScriptText = optimizeScriptDraftResult.content;

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      postInterview,
    };

    return updatedContext;
  }

  async STEP_createPostScriptDefinition(
    context: GeneratePostPipeline_Context,
  ): Promise<GeneratePostPipeline_Context> {
    const { postInterview } = context;

    if (!postInterview.generatedScriptText) {
      throw new BadRequestException('Script text not found');
    }

    const createPostScriptDefinitionPrompt =
      ScriptGenerationPrompts.FORMAT_SEO_SCRIPT_TO_JSON_PROMPT(
        postInterview,
        postInterview.generatedScriptText,
      );

    const createPostScriptDefinitionResult =
      await this.antrophicService.generate(createPostScriptDefinitionPrompt, {
        model: AnthropicModel.CLAUDE_HAIKU_4_5,
        maxTokens: 20480,
      });

    const parsedCreatePostScriptDefinitionResult = JSON.parse(
      createPostScriptDefinitionResult.content,
    ) as ScriptFormatDefinition;

    postInterview.generatedScriptDefinition =
      parsedCreatePostScriptDefinitionResult;

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      postInterview,
    };

    return updatedContext;
  }

  async STEP_generatePostPartsFromInterview(
    context: GeneratePostPipeline_Context,
  ): Promise<GeneratePostPipeline_Context> {
    const { postInterview } = context;
    if (!postInterview.generatedScriptDefinition) {
      throw new BadRequestException('Script definition not generated');
    }

    const { systemPrompts: introSystemPrompts, userPrompts: introUserPrompts } =
      PostGenerationPrompts.COPYWRITER_INTRODUCTION_PROMPT(
        postInterview.generatedScriptDefinition.indexSummary,
        postInterview.generatedScriptDefinition.head.h1,
        postInterview.generatedScriptDefinition.head.introductionDescription,
        postInterview.targetAudience,
        postInterview.toneOfVoice,
        postInterview.language,
        postInterview.generatedScriptDefinition.head.introductionLengthRange,
      );

    const introductionPromise = this.groqService.generate('', {
      model: GroqModel.GPT_OSS_120B_MODEL,
      maxTokens: 8096,
      systemPrompt: introSystemPrompts,
      userPrompt: introUserPrompts,
    });

    const sectionInputs =
      postInterview.generatedScriptDefinition.body.sections ?? [];

    const sectionBlockPromises = sectionInputs.map(async (section) => {
      const sectionTitle = section.title;

      // Parallelize image generation for all images in the section
      const sectionImageBlockPromises = (section.images ?? []).map(
        async (image) => {
          if (image.sourceType === 'ai_generated') {
            try {
              const generatedImage =
                await this.imageGenerationService.generateImage({
                  prompt:
                    image.description || `Image for section: ${sectionTitle}`,
                  aspectRatio: (image.aspectRatio as AspectRatio) || '16:9',
                });

              const imageTitle: string =
                image.title ||
                (image.description
                  ? image.description.split('.')[0].trim()
                  : `Image for ${sectionTitle}`);

              return {
                type: PostBlockType.IMAGE,
                image: {
                  sourceType: 'ai_generated',
                  sourceValue: generatedImage.url,
                  title: imageTitle,
                  description:
                    image.description || `Image related to ${sectionTitle}`,
                  alt: image.alt || `Image for ${sectionTitle}`,
                },
              } as PostBlock;
            } catch (error: unknown) {
              // Log error but continue
              console.error(
                `Failed to generate AI image for section ${sectionTitle}:`,
                error,
              );
              return null; // skip this image
            }
          } else if (image.sourceType === 'user') {
            const imageTitle: string =
              image.title ||
              (image.description
                ? image.description.split('.')[0].trim()
                : `Image for ${sectionTitle}`);

            return {
              type: PostBlockType.IMAGE,
              image: {
                sourceType: 'user',
                sourceValue: image.sourceValue,
                title: imageTitle,
                description:
                  image.description || `Image related to ${sectionTitle}`,
                alt: image.alt || `Image for ${sectionTitle}`,
              },
            } as PostBlock;
          } else {
            return null;
          }
        },
      );

      // Section content generation (LLM)
      const {
        systemPrompts: sectionSystemPrompts,
        userPrompts: sectionUserPrompts,
      } = PostGenerationPrompts.COPYWRITER_PARAGRAPH_PROMPT(
        postInterview.generatedScriptDefinition?.indexSummary ?? '',
        postInterview.targetAudience,
        postInterview.toneOfVoice,
        section,
        postInterview.language,
      );

      const sectionContentPromise = this.groqService.generate('', {
        model: GroqModel.GPT_OSS_120B_MODEL,
        maxTokens: 8096,
        systemPrompt: sectionSystemPrompts,
        userPrompt: sectionUserPrompts,
      });

      // Await both (content and images)
      const [imageBlockResults, sectionContentResult] = await Promise.all([
        Promise.all(sectionImageBlockPromises),
        sectionContentPromise,
      ]);
      const sectionImageBlocks: PostBlock[] = imageBlockResults.filter(
        Boolean,
      ) as PostBlock[];

      // Parse section content blocks as usual (with error correction)
      let sectionContentBlocks: { blocks: PostBlock[] };
      try {
        sectionContentBlocks = JSON.parse(sectionContentResult.content) as {
          blocks: PostBlock[];
        };
      } catch (parseError) {
        const { systemPrompts: fixSystemPrompts, userPrompts: fixUserPrompts } =
          FormattingPrompts.FIX_JSON_PROMPT(
            sectionContentResult.content,
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          );
        const fixedJsonResult = await this.groqService.generate('', {
          model: GroqModel.GPT_OSS_120B_MODEL,
          maxTokens: 8096,
          systemPrompt: fixSystemPrompts,
          userPrompt: fixUserPrompts,
        });
        try {
          sectionContentBlocks = JSON.parse(fixedJsonResult.content) as {
            blocks: PostBlock[];
          };
        } catch (retryParseError) {
          throw new BadRequestException(
            `Failed to parse section content JSON after fix attempt: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
          );
        }
      }

      // Build the blocks for the whole section
      const blocksForSection: PostBlock[] = [
        {
          type: PostBlockType.HEADING,
          level: section.level,
          title: sectionTitle,
        },
      ];
      // Insert images after first paragraph, rest at end
      let imageIndex = 0;
      for (let i = 0; i < sectionContentBlocks.blocks?.length; i++) {
        blocksForSection.push(sectionContentBlocks.blocks[i]);
        if (
          i === 0 &&
          sectionImageBlocks.length > 0 &&
          sectionContentBlocks.blocks[i].type === PostBlockType.PARAGRAPH
        ) {
          blocksForSection.push(sectionImageBlocks[imageIndex]);
          imageIndex++;
        }
      }
      while (imageIndex < sectionImageBlocks.length) {
        blocksForSection.push(sectionImageBlocks[imageIndex]);
        imageIndex++;
      }

      return blocksForSection;
    });

    let faqPromise: Promise<{ questions: string[]; answers: string[] } | null> =
      Promise.resolve(null);
    if (postInterview.generatedScriptDefinition.faq) {
      faqPromise = (async () => {
        const { systemPrompts: faqSystemPrompts, userPrompts: faqUserPrompts } =
          PostGenerationPrompts.COPYWRITER_FAQ_PROMPT(
            postInterview.generatedScriptDefinition?.indexSummary ?? '',
            postInterview.targetAudience,
            postInterview.toneOfVoice,
            postInterview.generatedScriptDefinition?.faq ?? {
              description: '',
              lengthRange: [0, 0],
            },
          );

        const faqResult = await this.groqService.generate('', {
          model: GroqModel.GPT_OSS_120B_MODEL,
          maxTokens: 8096,
          systemPrompt: faqSystemPrompts,
          userPrompt: faqUserPrompts,
        });

        let faqObject: { questions: string[]; answers: string[] };
        try {
          faqObject = JSON.parse(faqResult.content) as {
            questions: string[];
            answers: string[];
          };
        } catch (parseError) {
          // If JSON parsing fails, request a fix from the LLM
          const {
            systemPrompts: fixSystemPrompts,
            userPrompts: fixUserPrompts,
          } = FormattingPrompts.FIX_JSON_PROMPT(
            faqResult.content,
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          );

          const fixedJsonResult = await this.groqService.generate('', {
            model: GroqModel.GPT_OSS_120B_MODEL,
            maxTokens: 8096,
            systemPrompt: fixSystemPrompts,
            userPrompt: fixUserPrompts,
          });

          try {
            faqObject = JSON.parse(fixedJsonResult.content) as {
              questions: string[];
              answers: string[];
            };
          } catch (retryParseError) {
            throw new BadRequestException(
              `Failed to parse FAQ JSON after fix attempt: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
            );
          }
        }
        return faqObject;
      })();
    }

    const [introductionResult, allSectionBlocks, faqObject] = await Promise.all(
      [introductionPromise, Promise.all(sectionBlockPromises), faqPromise],
    );

    const blocks: PostBlock[] = [];

    let introductionBlocks: { blocks: PostBlock[] };
    try {
      introductionBlocks = JSON.parse(introductionResult.content) as {
        blocks: PostBlock[];
      };
    } catch (parseError) {
      const { systemPrompts: fixSystemPrompts, userPrompts: fixUserPrompts } =
        FormattingPrompts.FIX_JSON_PROMPT(
          introductionResult.content,
          parseError instanceof Error ? parseError.message : String(parseError),
        );

      const fixedJsonResult = await this.groqService.generate('', {
        model: GroqModel.GPT_OSS_120B_MODEL,
        maxTokens: 8096,
        systemPrompt: fixSystemPrompts,
        userPrompt: fixUserPrompts,
      });

      try {
        introductionBlocks = JSON.parse(fixedJsonResult.content) as {
          blocks: PostBlock[];
        };
      } catch (retryParseError) {
        throw new BadRequestException(
          `Failed to parse introduction JSON after fix attempt: ${retryParseError instanceof Error ? retryParseError.message : String(retryParseError)}`,
        );
      }
    }
    blocks.push(...introductionBlocks.blocks);

    // Add all section blocks in order
    for (const sectionBlocks of allSectionBlocks) {
      blocks.push(...sectionBlocks);
    }

    // Add FAQ if available
    if (faqObject) {
      blocks.push({
        type: PostBlockType.FAQ,
        questions: faqObject.questions,
        answers: faqObject.answers,
      });
    }

    let post: Post;
    if (context.post) {
      post = context.post;
    } else {
      post = new Post(randomUUID());
    }

    post.blocks = blocks;
    post.status = PostStatus.GENERATED;
    post.interviewId = postInterview.interviewId;

    await this.updateContext(context.pipelineId, {
      ...context,
      post,
    });

    // postInterview.associatedPostId = post._id as unknown as Post;
    // await postInterview.save();

    // After everything has gone good, we update the usage
    /* const postUsage = countPostUsage(post);
    await this.usageService.increaseUsageForUserInCurrentBillingPeriod(
      postInterview.userId as string,
      postUsage,
    ); */

    const updatedContext: GeneratePostPipeline_Context = {
      ...context,
      post,
    };

    return updatedContext;
  }

  /**
   * Pipeline to generate a script from a post interview
   */
  async runOnce(
    context: GeneratePostPipeline_Context,
  ): Promise<PipelineStepOutcome> {
    let newContext: GeneratePostPipeline_Context;
    switch (context.step) {
      case BasePipelineStep.INIT:
        newContext = context;
        newContext.step = GeneratePostPipelineStep.CREATE_SERP_RESEARCH_PLAN;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.CREATE_SERP_RESEARCH_PLAN:
        newContext =
          await this.STEP_generateResearchPlanForSerpQueries(context);
        newContext.step =
          GeneratePostPipelineStep.GATHER_AND_SUMMARIZE_EXA_RESEARCH_RESULTS;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.GATHER_AND_SUMMARIZE_EXA_RESEARCH_RESULTS:
        newContext =
          await this.STEP_gatherAndSummarizeExaResearchResults(context);
        newContext.step = GeneratePostPipelineStep.OPTIMIZE_SERP_SEARCH_RESULTS;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.OPTIMIZE_SERP_SEARCH_RESULTS:
        newContext = await this.STEP_optimizeSERP_SearchResults(context);
        newContext.step = GeneratePostPipelineStep.CREATE_SCRIPT_DRAFT;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.CREATE_SCRIPT_DRAFT:
        newContext = await this.STEP_createScriptDraft(context);
        newContext.step = GeneratePostPipelineStep.OPTIMIZE_SCRIPT_DRAFT;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.OPTIMIZE_SCRIPT_DRAFT:
        newContext = await this.STEP_optimizeScriptDraft(context);
        newContext.step =
          GeneratePostPipelineStep.CREATE_POST_SCRIPT_DEFINITION;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.CREATE_POST_SCRIPT_DEFINITION:
        newContext = await this.STEP_createPostScriptDefinition(context);
        newContext.step = GeneratePostPipelineStep.GENERATE_POST_PARTS;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'PROGRESSED',
        };
      case GeneratePostPipelineStep.GENERATE_POST_PARTS:
        newContext = await this.STEP_generatePostPartsFromInterview(context);
        newContext.step = BasePipelineStep.COMPLETED;
        await this.updateContext(context.pipelineId, newContext);
        return {
          type: 'TERMINAL',
        };
      default:
        throw new Error(`Unhandled step: ${context.step}`);
    }
  }
}
