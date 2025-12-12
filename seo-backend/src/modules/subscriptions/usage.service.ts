import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApplicationUsage, emptyUsage } from './library/usage.interface';
import { Usage } from './schemas/usage.schema';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class UsageService {
  constructor(
    @InjectModel(Usage.name) private usageModel: Model<Usage>,
    private subscriptionService: SubscriptionService,
  ) {}

  getBillingPeriodIdentifier(
    billingStartDate: Date,
    billingEndDate: Date,
  ): string {
    return `${billingStartDate.toISOString().split('T')[0]}-${billingEndDate.toISOString().split('T')[0]}`;
  }

  private async getOrCreateUsageRecordForCurrentBillingPeriod(userId: string) {
    const activeSubscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(userId);

    const billingPeriodIdentifier = this.getBillingPeriodIdentifier(
      activeSubscription.billingPeriodStart,
      activeSubscription.billingPeriodEnd,
    );

    const usageRecord = await this.usageModel
      .findOneAndUpdate(
        {
          subscriptionId: activeSubscription._id,
          billingPeriodIdentifier,
        },
        {
          $setOnInsert: {
            subscriptionId: activeSubscription._id,
            billingPeriodIdentifier,
            usage: emptyUsage(),
          },
        },
        {
          new: true,
          upsert: true,
        },
      )
      .exec();

    return usageRecord;
  }

  async getUsageForCurrentBillingPeriod(userId: string) {
    const usageRecord =
      await this.getOrCreateUsageRecordForCurrentBillingPeriod(userId);
    return usageRecord.usage;
  }

  async increaseUsageForUserInCurrentBillingPeriod(
    userId: string,
    usage: ApplicationUsage,
  ) {
    const activeSubscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(userId);

    const billingPeriodIdentifier = this.getBillingPeriodIdentifier(
      activeSubscription.billingPeriodStart,
      activeSubscription.billingPeriodEnd,
    );

    // First, ensure the document exists with proper structure
    await this.usageModel
      .findOneAndUpdate(
        {
          subscriptionId: activeSubscription._id,
          billingPeriodIdentifier,
        },
        {
          $setOnInsert: {
            subscriptionId: activeSubscription._id,
            billingPeriodIdentifier,
            usage: emptyUsage(),
          },
        },
        {
          upsert: true,
        },
      )
      .exec();

    // Then increment the usage values
    await this.usageModel
      .findOneAndUpdate(
        {
          subscriptionId: activeSubscription._id,
          billingPeriodIdentifier,
        },
        {
          $inc: {
            'usage.aiGeneratedImages': usage.aiGeneratedImages,
            'usage.generatedWords': usage.generatedWords,
          },
        },
      )
      .exec();
  }
}
