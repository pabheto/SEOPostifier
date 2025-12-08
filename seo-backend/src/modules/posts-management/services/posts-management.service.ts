import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AspectRatio,
  NanoBananaImageGenerationService,
} from 'src/modules/image-generation/services/nano-banana-image-generation.service';
import {
  GPT_OSS_120B_MODEL,
  GROQ_COMPOUND,
  MEDIUM_GENERATION_MODEL,
} from 'src/modules/llm-manager';
import { GroqService } from 'src/modules/llm-manager/groq.service';
import { ScriptsPrompting } from 'src/modules/llm-manager/library/prompts/scripts.prompting';
import { InterviewStatus } from '../library/interfaces/post-interview.interface';
import {
  PostBlock,
  PostBlockType,
  PostParagraph,
  PostStatus,
} from '../library/interfaces/posts.interface';
import { PostInterviewDocument } from '../schemas/post-interview.schema';
import { Post, PostDocument } from '../schemas/posts.schema';
import { PostInterviewsService } from './posts-interviews.service';

@Injectable()
export class PostsManagementService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly postInterviewsService: PostInterviewsService,
    @Inject(forwardRef(() => GroqService))
    private readonly groqService: GroqService,
    private readonly imageGenerationService: NanoBananaImageGenerationService,
  ) {}

  async createPostDraftFromInterview(postInterview: PostInterviewDocument) {
    if (
      postInterview.status !== InterviewStatus.SCRIPT_DEFINITION_GENERATED ||
      !postInterview.generatedScriptDefinition
    ) {
      throw new BadRequestException(
        'Post interview is not ready to create post',
      );
    }

    if (!postInterview.interviewId) {
      throw new BadRequestException(
        'Post interview does not have an interviewId',
      );
    }

    const post = new this.postModel({
      interviewId: postInterview.interviewId,
      userId: postInterview.userId,
      status: PostStatus.DRAFT,
      title: postInterview.generatedScriptDefinition.head.h1,
      slug: postInterview.generatedScriptDefinition.head.slug,
      language: postInterview.language,
    });
    await post.save();

    const blocks: PostBlock[] = [];

    // Parallel: Start generating introduction/result, all sections (content and images), and FAQ (if available)
    const sectionInputs =
      postInterview.generatedScriptDefinition.body.sections ?? [];

    // Introduction prompt (single)
    const { systemPrompts: introSystemPrompts, userPrompts: introUserPrompts } =
      ScriptsPrompting.COPYWRITER_INTRODUCTION_PROMPT(
        postInterview.generatedScriptDefinition.indexSummary,
        postInterview.generatedScriptDefinition.head.h1,
        postInterview.generatedScriptDefinition.head.introductionDescription,
        postInterview.targetAudience,
        postInterview.toneOfVoice,
        postInterview.language,
        postInterview.generatedScriptDefinition.head.introductionLengthRange,
      );

    const introductionPromise = this.groqService.generate('', {
      model: MEDIUM_GENERATION_MODEL,
      maxTokens: 8096,
      systemPrompt: introSystemPrompts,
      userPrompt: introUserPrompts,
    });

    // Each section: parallelize content and image generation
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
      } = ScriptsPrompting.COPYWRITER_PARAGRAPH_PROMPT(
        postInterview.generatedScriptDefinition?.indexSummary ?? '',
        postInterview.targetAudience,
        postInterview.toneOfVoice,
        section,
      );

      const sectionContentPromise = this.groqService.generate('', {
        model: section.requiresDeepResearch
          ? GROQ_COMPOUND
          : MEDIUM_GENERATION_MODEL,
        maxTokens: section.requiresDeepResearch ? 8096 : 8096,
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
          ScriptsPrompting.FIX_JSON_PROMPT(
            sectionContentResult.content,
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          );
        const fixedJsonResult = await this.groqService.generate('', {
          model: section.requiresDeepResearch
            ? GROQ_COMPOUND
            : MEDIUM_GENERATION_MODEL,
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
      for (let i = 0; i < sectionContentBlocks.blocks.length; i++) {
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

    // FAQ: parallelize if available
    let faqPromise: Promise<{ questions: string[]; answers: string[] } | null> =
      Promise.resolve(null);
    if (postInterview.generatedScriptDefinition.faq) {
      faqPromise = (async () => {
        const { systemPrompts: faqSystemPrompts, userPrompts: faqUserPrompts } =
          ScriptsPrompting.COPYWRITER_FAQ_PROMPT(
            postInterview.generatedScriptDefinition?.indexSummary ?? '',
            postInterview.targetAudience,
            postInterview.toneOfVoice,
            postInterview.generatedScriptDefinition?.faq ?? {
              description: '',
              lengthRange: [0, 0],
            },
          );

        const faqResult = await this.groqService.generate('', {
          model: MEDIUM_GENERATION_MODEL,
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
          } = ScriptsPrompting.FIX_JSON_PROMPT(
            faqResult.content,
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          );

          const fixedJsonResult = await this.groqService.generate('', {
            model: MEDIUM_GENERATION_MODEL,
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

    // Await the three major groups in parallel
    const [introductionResult, allSectionBlocks, faqObject] = await Promise.all(
      [introductionPromise, Promise.all(sectionBlockPromises), faqPromise],
    );

    // Parse intro (with error correction) same as before
    let introductionBlocks: { blocks: PostBlock[] };
    try {
      introductionBlocks = JSON.parse(introductionResult.content) as {
        blocks: PostBlock[];
      };
    } catch (parseError) {
      const { systemPrompts: fixSystemPrompts, userPrompts: fixUserPrompts } =
        ScriptsPrompting.FIX_JSON_PROMPT(
          introductionResult.content,
          parseError instanceof Error ? parseError.message : String(parseError),
        );

      const fixedJsonResult = await this.groqService.generate('', {
        model: MEDIUM_GENERATION_MODEL,
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

    // NEW STEP: Optimize each section content for SEO and reduce redundancies
    const optimizedBlocks = await this.optimizeBlocksForSEO(
      blocks,
      postInterview.generatedScriptDefinition.head.h1,
      postInterview.targetAudience,
      postInterview.language,
    );

    post.blocks = optimizedBlocks;
    post.status = PostStatus.GENERATED;
    await post.save();

    postInterview.associatedPostId = post._id as unknown as Post;
    await postInterview.save();

    return post;
  }

  /**
   * Optimize all paragraph blocks for SEO by reducing redundancies and improving content quality
   * Processes all content together to identify real redundancies across sections
   * @param blocks - Array of post blocks to optimize
   * @param postTitle - Title of the post for context
   * @param targetAudience - Target audience for context
   * @param language - Language of the content
   * @returns Array of optimized blocks
   */
  private async optimizeBlocksForSEO(
    blocks: PostBlock[],
    postTitle: string,
    targetAudience: string,
    language: string,
  ): Promise<PostBlock[]> {
    // Extract all paragraph blocks with their indices
    const paragraphIndices: number[] = [];
    const paragraphContents: string[] = [];

    blocks.forEach((block, index) => {
      if (block.type === PostBlockType.PARAGRAPH) {
        paragraphIndices.push(index);
        paragraphContents.push((block as PostParagraph).content);
      }
    });

    // If no paragraphs to optimize, return original blocks
    if (paragraphContents.length === 0) {
      return blocks;
    }

    try {
      // Build the full content context with numbered sections
      const fullContent = paragraphContents
        .map((content, idx) => `[SECTION ${idx + 1}]\n${content}`)
        .join('\n\n');

      const systemPrompt = `You are an expert SEO content optimizer and editor. Your task is to review ALL sections together and:
1. Identify and eliminate redundancies across ALL sections (repeated ideas, phrases, or information)
2. Optimize for SEO without keyword stuffing
3. Improve readability and clarity
4. Maintain the original message and tone of each section
5. Keep the content concise and impactful
6. Ensure each section adds unique value without repeating what other sections already covered

CRITICAL: You must return a valid JSON object with this exact structure:
{
  "sections": [
    "optimized text for section 1",
    "optimized text for section 2",
    ...
  ]
}

The "sections" array must contain exactly ${paragraphContents.length} optimized paragraphs in the same order.`;

      const userPrompt = `Post Title: "${postTitle}"
Target Audience: ${targetAudience}
Language: ${language}

Here are ALL the sections of the post. Review them together to identify redundancies across sections:

${fullContent}

Optimize all ${paragraphContents.length} sections together, reducing redundancies while maintaining the unique value of each section. Return a JSON object with the "sections" array containing all optimized paragraphs in order.`;

      const optimizedResult = await this.groqService.generate('', {
        model: GPT_OSS_120B_MODEL,
        maxTokens: 8096,
        temperature: 0.7,
        systemPrompt,
        userPrompt,
      });

      // Parse the response
      let optimizedSections: { sections: string[] };
      try {
        optimizedSections = JSON.parse(optimizedResult.content) as {
          sections: string[];
        };
      } catch (parseError) {
        // If JSON parsing fails, request a fix from the LLM
        const { systemPrompts: fixSystemPrompts, userPrompts: fixUserPrompts } =
          ScriptsPrompting.FIX_JSON_PROMPT(
            optimizedResult.content,
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          );

        const fixedJsonResult = await this.groqService.generate('', {
          model: GPT_OSS_120B_MODEL,
          maxTokens: 8096,
          systemPrompt: fixSystemPrompts,
          userPrompt: fixUserPrompts,
        });

        optimizedSections = JSON.parse(fixedJsonResult.content) as {
          sections: string[];
        };
      }

      // Validate we got the right number of sections
      if (optimizedSections.sections.length !== paragraphContents.length) {
        throw new Error(
          `Expected ${paragraphContents.length} optimized sections but got ${optimizedSections.sections.length}`,
        );
      }

      // Create a new blocks array with optimized paragraphs
      const optimizedBlocks = [...blocks];
      paragraphIndices.forEach((originalIndex, idx) => {
        optimizedBlocks[originalIndex] = {
          ...optimizedBlocks[originalIndex],
          content: optimizedSections.sections[idx].trim(),
        } as PostBlock;
      });

      return optimizedBlocks;
    } catch (error) {
      // If optimization fails, log error and return original blocks
      console.error('Failed to optimize content for SEO:', error);
      return blocks;
    }
  }

  async listPostsForUser(userId: string) {
    return this.postModel.find({ userId });
  }

  async getPostById(postId: string) {
    return this.postModel.findById(postId);
  }
}
