import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MEDIUM_GENERATION_MODEL } from 'src/modules/llm-manager';
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
        postInterview.generatedScriptDefinition.head.introductionLengthRange,
      ),
      {
        model: MEDIUM_GENERATION_MODEL,
        maxTokens: 8096,
      },
    );

    // Don't add H1 heading block as WordPress already uses the post title as H1
    blocks.push({
      type: PostBlockType.PARAGRAPH,
      content: introductionResult.content,
    });

    for (const section of postInterview.generatedScriptDefinition.body
      .sections) {
      const sectionTitle = section.title;
      const sectionContentResult = await this.groqService.generate(
        ScriptsPrompting.COPYWRITER_PARAGRAPH_PROMPT(
          postInterview.generatedScriptDefinition.indexSummary,
          postInterview.targetAudience,
          postInterview.toneOfVoice,
          section,
        ),
        {
          model: MEDIUM_GENERATION_MODEL,
          maxTokens: 20000,
        },
      );

      const sectionContentBlocks = JSON.parse(sectionContentResult.content) as {
        blocks: PostBlock[];
      };
      blocks.push({
        type: PostBlockType.HEADING,
        level: section.level,
        title: sectionTitle,
      });
      blocks.push(...sectionContentBlocks.blocks);
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

      const faqObject = JSON.parse(faqResult.content) as {
        questions: string[];
        answers: string[];
      };

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
