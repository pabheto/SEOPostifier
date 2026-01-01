import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { buildPipelineId } from '../posts-generation/library/pipelines/pipeline-ids.util';
import { AvailablePipelines } from '../posts-generation/library/pipelines/pipeline.interface';
import { GeneratePostPipeline_Context } from '../posts-generation/pipelines/generate-post.pipeline';
import { PipelineOrchestrator } from '../posts-generation/pipelines/pipeline.orchestrator';
import {
  PostInterviewsRepository,
  type PaginatedResult,
} from '../posts-management/repositories/post-interviews.repository';
import { PostsRepository } from '../posts-management/repositories/posts.repository';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly postInterviewsRepository: PostInterviewsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly pipelineOrchestrator: PipelineOrchestrator,
  ) {}

  async getAllUsers() {
    const users = await this.userModel
      .find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'USER',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  }

  async getUserById(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'USER',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    );

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'USER',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getAllPostInterviews(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    return this.postInterviewsRepository.findAllPaginated({
      page,
      limit,
    });
  }

  async getPostContentByInterviewId(interviewId: string) {
    const interview = await this.postInterviewsRepository.findById(interviewId);

    if (!interview) {
      throw new NotFoundException(
        `Post interview not found with interviewId: ${interviewId}`,
      );
    }

    if (!interview.associatedPostId) {
      throw new NotFoundException(
        `No generated content found for interview: ${interviewId}`,
      );
    }

    // Get postId as string (handle ObjectId or string)
    const associatedPost = interview.associatedPostId;
    const postId =
      typeof associatedPost === 'string'
        ? associatedPost
        : (associatedPost as { toString(): string }).toString();

    const post = await this.postsRepository.findById(postId);

    if (!post) {
      throw new NotFoundException(
        `Post not found for interview: ${interviewId}`,
      );
    }

    return {
      interviewId: interview.interviewId,
      postId: post.postId,
      title: post.title,
      slug: post.slug,
      mainKeyword: post.mainKeyword,
      secondaryKeywords: post.secondaryKeywords,
      language: post.language,
      status: post.status,
      blocks: post.blocks || [],
      createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getPipelineContextByInterviewId(interviewId: string) {
    const pipelineId = buildPipelineId(
      AvailablePipelines.GENERATE_POST_PIPELINE,
      interviewId,
    );

    return await this.pipelineOrchestrator.getContextForPipeline<GeneratePostPipeline_Context>(
      pipelineId,
    );
  }
}
