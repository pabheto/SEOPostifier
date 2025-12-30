import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsageExceededException } from 'src/library/exceptions/usage.exceptions';
import { NanoBananaImageGenerationService } from 'src/modules/image-generation/services/nano-banana-image-generation.service';
import { GroqService } from 'src/modules/llm-manager/groq.service';
import { PostGenerationManagementService } from 'src/modules/posts-generation/post-generation-management.service';
import { AVAILABLE_PLANS } from 'src/modules/subscriptions/plans/plans.definition';
import { SubscriptionService } from 'src/modules/subscriptions/subscription.service';
import { UsageService } from 'src/modules/subscriptions/usage.service';
import { PostInterviewDocument } from '../schemas/post-interview.schema';
import { Post, PostDocument } from '../schemas/posts.schema';
import { PostInterviewsService } from './posts-interviews.service';
import { PipelineVerbosedStatus } from 'src/modules/posts-generation/library/interfaces/pipelines/pipeline-status.interface';

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
    @Inject(forwardRef(() => PostGenerationManagementService))
    private readonly postGenerationManagementService: PostGenerationManagementService,
  ) {}

  async createPostDraftFromInterview(postInterview: PostInterviewDocument) {
    const currentCycleUserUsage =
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

    await this.postGenerationManagementService.scheduleGeneration_PostInterview(
      postInterview,
    );
  }

  async checkGenerationStatusOfPost(
    postInterview: PostInterviewDocument,
  ): Promise<PipelineVerbosedStatus> {
    const generationStatus =
      await this.postGenerationManagementService.getGenerationStatus_PostInterview(
        postInterview,
      );

    return generationStatus;
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
