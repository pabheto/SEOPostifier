import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SubscriptionStatus,
  UserSubscription,
} from '../users/schemas/subscription.schema';
import { PlanIdentifier } from './plans/plans.definition';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(UserSubscription.name)
    private subscriptionModel: Model<UserSubscription>,
  ) {}

  async getSubscriptionForUser(
    userId: string,
  ): Promise<UserSubscription | null> {
    const subscription = await this.subscriptionModel
      .findOne({ userId })
      .exec();
    if (!subscription) {
      return null;
    }
    return subscription as UserSubscription;
  }

  async createSubscriptionForUser(userId: string): Promise<UserSubscription> {
    const subscription = await this.subscriptionModel.create({
      userId,
      plan: PlanIdentifier.FREE,
      status: SubscriptionStatus.ACTIVE,
      billingPeriodStart: new Date(Date.now()),
      billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return subscription as UserSubscription;
  }

  async getOrCreateSubscriptionForUser(
    userId: string,
  ): Promise<UserSubscription> {
    const subscription = await this.subscriptionModel
      .findOne({ userId })
      .exec();
    if (!subscription) {
      return this.createSubscriptionForUser(userId);
    }
    return subscription as UserSubscription;
  }

  async changePlanForUserSubscription(userId: string, plan: PlanIdentifier) {
    const subscription = await this.getOrCreateSubscriptionForUser(userId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    subscription.plan = plan;
    await subscription.save();
    return subscription;
  }
}
