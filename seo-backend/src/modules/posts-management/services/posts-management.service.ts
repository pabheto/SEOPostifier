import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NanoBananaImageGenerationService } from 'src/modules/image-generation/services/nano-banana-image-generation.service';
import {
  GROQ_COMPOUND,
  MEDIUM_GENERATION_MODEL,
} from 'src/modules/llm-manager';
import { GroqService } from 'src/modules/llm-manager/groq.service';
import { ScriptsPrompting } from 'src/modules/llm-manager/library/prompts/scripts.prompting';
import { InterviewStatus } from '../library/interfaces/post-interview.interface';
import {
  PostBlock,
  PostBlockType,
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

    // Generating the different sections of the post
    const introductionResult = await this.groqService.generate(
      ScriptsPrompting.COPYWRITER_INTRODUCTION_PROMPT(
        postInterview.generatedScriptDefinition.indexSummary,
        postInterview.generatedScriptDefinition.head.h1,
        postInterview.generatedScriptDefinition.head.introductionDescription,
        postInterview.targetAudience,
        postInterview.toneOfVoice,
        postInterview.language,
        postInterview.generatedScriptDefinition.head.introductionLengthRange,
      ),
      {
        model: MEDIUM_GENERATION_MODEL,
        maxTokens: 8096,
      },
    );

    // Parse introduction blocks from JSON response
    // Don't add H1 heading block as WordPress already uses the post title as H1
    let introductionBlocks: { blocks: PostBlock[] };
    try {
      introductionBlocks = JSON.parse(introductionResult.content) as {
        blocks: PostBlock[];
      };
    } catch (parseError) {
      // If JSON parsing fails, request a fix from the LLM
      const fixPrompt = ScriptsPrompting.FIX_JSON_PROMPT(
        introductionResult.content,
        parseError instanceof Error ? parseError.message : String(parseError),
      );

      const fixedJsonResult = await this.groqService.generate(fixPrompt, {
        model: MEDIUM_GENERATION_MODEL,
        maxTokens: 8096,
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

    for (const section of postInterview.generatedScriptDefinition.body
      .sections) {
      const sectionTitle = section.title;

      // Process images for this section
      const sectionImageBlocks: PostBlock[] = [];
      if (section.images && section.images.length > 0) {
        for (const image of section.images) {
          if (image.sourceType === 'ai_generated') {
            // Generate AI image
            try {
              const generatedImage =
                await this.imageGenerationService.generateImage({
                  prompt:
                    image.description || `Image for section: ${sectionTitle}`,
                  aspectRatio: '16:9', // Use widescreen format for blog post images
                });

              // Create image block with generated image data
              // Generate title from description or section if not provided
              const imageTitle: string =
                image.title ||
                (image.description
                  ? image.description.split('.')[0].trim()
                  : `Image for ${sectionTitle}`);

              sectionImageBlocks.push({
                type: PostBlockType.IMAGE,
                image: {
                  sourceType: 'ai_generated',
                  sourceValue: generatedImage.url,
                  title: imageTitle,
                  description:
                    image.description || `Image related to ${sectionTitle}`,
                  alt: image.alt || `Image for ${sectionTitle}`,
                },
              });
            } catch (error: unknown) {
              // Log error but continue with post generation
              console.error(
                `Failed to generate AI image for section ${sectionTitle}:`,
                error,
              );
              // Optionally create a placeholder image block or skip
            }
          } else if (image.sourceType === 'user') {
            // Use user-provided image
            // Generate title from description or section if not provided
            const imageTitle: string =
              image.title ||
              (image.description
                ? image.description.split('.')[0].trim()
                : `Image for ${sectionTitle}`);

            sectionImageBlocks.push({
              type: PostBlockType.IMAGE,
              image: {
                sourceType: 'user',
                sourceValue: image.sourceValue,
                title: imageTitle,
                description:
                  image.description || `Image related to ${sectionTitle}`,
                alt: image.alt || `Image for ${sectionTitle}`,
              },
            });
          }
        }
      }

      const sectionContentResult = await this.groqService.generate(
        ScriptsPrompting.COPYWRITER_PARAGRAPH_PROMPT(
          postInterview.generatedScriptDefinition.indexSummary,
          postInterview.targetAudience,
          postInterview.toneOfVoice,
          section,
        ),
        {
          model: section.requiresDeepResearch
            ? GROQ_COMPOUND
            : MEDIUM_GENERATION_MODEL,
          maxTokens: section.requiresDeepResearch ? 8096 : 8096,
        },
      );

      let sectionContentBlocks: { blocks: PostBlock[] };
      try {
        sectionContentBlocks = JSON.parse(sectionContentResult.content) as {
          blocks: PostBlock[];
        };
      } catch (parseError) {
        // If JSON parsing fails, request a fix from the LLM
        const fixPrompt = ScriptsPrompting.FIX_JSON_PROMPT(
          sectionContentResult.content,
          parseError instanceof Error ? parseError.message : String(parseError),
        );

        const fixedJsonResult = await this.groqService.generate(fixPrompt, {
          model: section.requiresDeepResearch
            ? GROQ_COMPOUND
            : MEDIUM_GENERATION_MODEL,
          maxTokens: 8096,
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
      blocks.push({
        type: PostBlockType.HEADING,
        level: section.level,
        title: sectionTitle,
      });

      // Insert images at appropriate positions within the section content
      // For now, we'll add images after the first paragraph block
      // This can be enhanced later to support more sophisticated placement
      let imageIndex = 0;
      for (let i = 0; i < sectionContentBlocks.blocks.length; i++) {
        blocks.push(sectionContentBlocks.blocks[i]);
        // Insert image after first paragraph if available
        if (
          i === 0 &&
          sectionImageBlocks.length > 0 &&
          sectionContentBlocks.blocks[i].type === PostBlockType.PARAGRAPH
        ) {
          blocks.push(sectionImageBlocks[imageIndex]);
          imageIndex++;
        }
      }

      // Add any remaining images at the end of the section
      while (imageIndex < sectionImageBlocks.length) {
        blocks.push(sectionImageBlocks[imageIndex]);
        imageIndex++;
      }
    }

    if (postInterview.generatedScriptDefinition.faq) {
      const faqResult = await this.groqService.generate(
        ScriptsPrompting.COPYWRITER_FAQ_PROMPT(
          postInterview.generatedScriptDefinition.indexSummary,
          postInterview.targetAudience,
          postInterview.toneOfVoice,
          postInterview.generatedScriptDefinition.faq,
        ),
        {
          model: MEDIUM_GENERATION_MODEL,
          maxTokens: 8096,
        },
      );

      let faqObject: { questions: string[]; answers: string[] };
      try {
        faqObject = JSON.parse(faqResult.content) as {
          questions: string[];
          answers: string[];
        };
      } catch (parseError) {
        // If JSON parsing fails, request a fix from the LLM
        const fixPrompt = ScriptsPrompting.FIX_JSON_PROMPT(
          faqResult.content,
          parseError instanceof Error ? parseError.message : String(parseError),
        );

        const fixedJsonResult = await this.groqService.generate(fixPrompt, {
          model: MEDIUM_GENERATION_MODEL,
          maxTokens: 8096,
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

      blocks.push({
        type: PostBlockType.FAQ,
        questions: faqObject.questions,
        answers: faqObject.answers,
      });
    }

    // Update the post with the generated blocks and change status
    post.blocks = blocks;
    post.status = PostStatus.GENERATED;
    await post.save();

    postInterview.associatedPostId = post._id as unknown as Post;
    await postInterview.save();

    return post;
  }

  async listPostsForUser(userId: string) {
    return this.postModel.find({ userId });
  }

  async getPostById(postId: string) {
    return this.postModel.findById(postId);
  }
}
