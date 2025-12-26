import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NanoBananaImageGenerationService } from 'src/modules/image-generation/services/nano-banana-image-generation.service';
import { GroqService } from 'src/modules/llm-manager/groq.service';
import { SubscriptionService } from 'src/modules/subscriptions/subscription.service';
import { UsageService } from 'src/modules/subscriptions/usage.service';
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
    private readonly usageService: UsageService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createPostDraftFromInterview(postInterview: PostInterviewDocument) {
    // Usage checks
    /* const currentCycleUserUsage =
      await this.usageService.getUsageForCurrentBillingPeriod(
        postInterview.userId as string,
      );
    const userActiveSubscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(
        postInterview.userId as string,
      );

    if (
      currentCycleUserUsage.aiGeneratedImages +
        (postInterview.imagesConfig.aiImagesCount ?? 0) >
      AVAILABLE_PLANS[userActiveSubscription.plan].aiImageGenerationPerMonth
    ) {
      throw new UsageExceededException(
        'You have reached the maximum number of AI generated images for the current billing period',
      );
    }

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
      model: GROQ_MEDIUM_GENERATION_MODEL,
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
        postInterview.language,
      );

      const sectionContentPromise = this.groqService.generate('', {
        model: section.requiresDeepResearch
          ? GROQ_COMPOUND
          : GROQ_MEDIUM_GENERATION_MODEL,
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
            : GROQ_MEDIUM_GENERATION_MODEL,
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
          model: GROQ_MEDIUM_GENERATION_MODEL,
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
            model: GROQ_MEDIUM_GENERATION_MODEL,
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
        model: GROQ_MEDIUM_GENERATION_MODEL,
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

    post.blocks = blocks;
    post.status = PostStatus.GENERATED;
    await post.save();

    postInterview.associatedPostId = post._id as unknown as Post;
    await postInterview.save();

    // After everything has gone good, we update the usage
    const postUsage = countPostUsage(post);
    await this.usageService.increaseUsageForUserInCurrentBillingPeriod(
      postInterview.userId as string,
      postUsage,
    );

    return post;
    */
  }

  async listPostsForUser(userId: string) {
    return this.postModel.find({ userId });
  }

  async getPostById(postId: string, userId?: string) {
    if (userId) {
      return this.postModel.findOne({ _id: postId, userId });
    }
    return this.postModel.findById(postId);
  }
}
