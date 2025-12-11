import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { PlanIdentifier } from './plans/plans.definition';
import { UserSubscription } from './schemas/subscription.schema';
import { StripeService } from './stripe/stripe.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(UserSubscription.name)
    private subscriptionModel: Model<UserSubscription>,
    private stripeService: StripeService,
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

  /**
   * Update subscription from Stripe webhook event
   */
  async updateSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription,
  ): Promise<UserSubscription> {
    const userId = stripeSubscription.metadata?.userId;
    if (!userId) {
      throw new Error('User ID not found in Stripe subscription metadata');
    }

    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      throw new Error('Price ID not found in Stripe subscription');
    }

    const plan = this.stripeService.getPlanFromPriceId(priceId);
    if (!plan) {
      throw new Error(`Plan not found for price ID: ${priceId}`);
    }

    // Calculate billing period dates
    // Stripe returns timestamps as Unix timestamps (seconds since epoch)
    const subscriptionData = stripeSubscription as any;
    const currentPeriodStart =
      subscriptionData.current_period_start ||
      subscriptionData.currentPeriodStart;
    const currentPeriodEnd =
      subscriptionData.current_period_end || subscriptionData.currentPeriodEnd;

    if (!currentPeriodStart || !currentPeriodEnd) {
      throw new Error('Billing period dates not found in Stripe subscription');
    }

    const billingPeriodStart = new Date(
      typeof currentPeriodStart === 'number'
        ? currentPeriodStart * 1000
        : currentPeriodStart,
    );
    const billingPeriodEnd = new Date(
      typeof currentPeriodEnd === 'number'
        ? currentPeriodEnd * 1000
        : currentPeriodEnd,
    );

    // Find or create subscription
    let subscription = await this.subscriptionModel.findOne({ userId }).exec();

    if (subscription) {
      subscription.plan = plan;
      subscription.stripeCustomerId = stripeSubscription.customer as string;
      subscription.stripeSubscriptionId = stripeSubscription.id;
      subscription.stripePriceId = priceId;
      subscription.stripeStatus = stripeSubscription.status;
      subscription.billingPeriodStart = billingPeriodStart;
      subscription.billingPeriodEnd = billingPeriodEnd;
      await subscription.save();
    } else {
      subscription = await this.subscriptionModel.create({
        userId,
        plan,
        stripeCustomerId: stripeSubscription.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        stripeStatus: stripeSubscription.status,
        billingPeriodStart,
        billingPeriodEnd,
      });
    }

    this.logger.log(
      `Updated subscription for user ${userId} from Stripe webhook`,
    );

    return subscription as UserSubscription;
  }

  /**
   * Update subscription when customer is created/updated
   */
  async updateSubscriptionCustomerId(
    userId: string,
    customerId: string,
  ): Promise<UserSubscription> {
    const subscription = await this.getOrCreateSubscriptionForUser(userId);
    subscription.stripeCustomerId = customerId;
    await subscription.save();
    return subscription;
  }

  /**
   * Cancel subscription (mark as canceled in database)
   */
  async cancelSubscription(userId: string): Promise<UserSubscription> {
    const subscription = await this.subscriptionModel
      .findOne({ userId })
      .exec();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // If there's a Stripe subscription, cancel it
    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId,
          false, // Cancel at period end
        );
      } catch (error) {
        this.logger.error(
          `Error canceling Stripe subscription: ${error.message}`,
        );
      }
    }

    // Update to free plan
    subscription.plan = PlanIdentifier.FREE;
    subscription.stripeStatus = 'canceled';
    await subscription.save();

    return subscription;
  }
}
