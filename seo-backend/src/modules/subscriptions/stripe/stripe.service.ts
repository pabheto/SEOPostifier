import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BillingPeriod } from '../dto/create-checkout.dto';
import { PlanIdentifier } from '../plans/plans.definition';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  /**
   * Get the Stripe price ID for a plan and billing period
   * In production, these should be stored in environment variables or database
   */
  private getPriceId(
    plan: PlanIdentifier,
    billingPeriod: BillingPeriod,
  ): string {
    const priceIdMap: Record<string, string> = {
      [`${PlanIdentifier.BASIC}-monthly`]:
        this.configService.get<string>('STRIPE_PRICE_ID_BASIC_MONTHLY') || '',
      [`${PlanIdentifier.BASIC}-annual`]:
        this.configService.get<string>('STRIPE_PRICE_ID_BASIC_ANNUAL') || '',
      [`${PlanIdentifier.PREMIUM}-monthly`]:
        this.configService.get<string>('STRIPE_PRICE_ID_PREMIUM_MONTHLY') || '',
      [`${PlanIdentifier.PREMIUM}-annual`]:
        this.configService.get<string>('STRIPE_PRICE_ID_PREMIUM_ANNUAL') || '',
      [`${PlanIdentifier.AGENCY}-monthly`]:
        this.configService.get<string>('STRIPE_PRICE_ID_AGENCY_MONTHLY') || '',
      [`${PlanIdentifier.AGENCY}-annual`]:
        this.configService.get<string>('STRIPE_PRICE_ID_AGENCY_ANNUAL') || '',
    };

    const key = `${plan}-${billingPeriod}`;
    const priceId = priceIdMap[key];

    if (!priceId) {
      throw new Error(
        `Stripe price ID not configured for plan ${plan} with billing period ${billingPeriod}`,
      );
    }

    return priceId;
  }

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(
    userId: string,
    userEmail: string,
    plan: PlanIdentifier,
    billingPeriod: BillingPeriod,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const priceId = this.getPriceId(plan, billingPeriod);

      // Check if customer already exists
      let customerId: string | undefined;
      const existingCustomers = await this.stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          plan,
          billingPeriod,
        },
        subscription_data: {
          metadata: {
            userId,
            plan,
            billingPeriod,
          },
        },
      });

      this.logger.log(
        `Created checkout session ${session.id} for user ${userId} and plan ${plan}`,
      );

      return session;
    } catch (error) {
      this.logger.error(
        `Error creating checkout session: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a Stripe customer portal session for managing subscriptions
   */
  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      this.logger.log(
        `Created customer portal session ${session.id} for customer ${customerId}`,
      );

      return session;
    } catch (error) {
      this.logger.error(
        `Error creating customer portal session: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Cancel a Stripe subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false,
  ): Promise<Stripe.Subscription> {
    try {
      if (immediately) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        // Cancel at period end
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error canceling subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get subscription details from Stripe
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Error retrieving subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get customer details from Stripe
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return (await this.stripe.customers.retrieve(
        customerId,
      )) as Stripe.Customer;
    } catch (error) {
      this.logger.error(
        `Error retrieving customer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Map Stripe subscription status to plan identifier
   */
  getPlanFromPriceId(priceId: string): PlanIdentifier | null {
    // This should match your Stripe price IDs
    // You might want to store this mapping in a database or config
    const priceIdToPlan: Record<string, PlanIdentifier> = {
      [this.configService.get<string>('STRIPE_PRICE_ID_BASIC_MONTHLY') || '']:
        PlanIdentifier.BASIC,
      [this.configService.get<string>('STRIPE_PRICE_ID_BASIC_ANNUAL') || '']:
        PlanIdentifier.BASIC,
      [this.configService.get<string>('STRIPE_PRICE_ID_PREMIUM_MONTHLY') || '']:
        PlanIdentifier.PREMIUM,
      [this.configService.get<string>('STRIPE_PRICE_ID_PREMIUM_ANNUAL') || '']:
        PlanIdentifier.PREMIUM,
      [this.configService.get<string>('STRIPE_PRICE_ID_AGENCY_MONTHLY') || '']:
        PlanIdentifier.AGENCY,
      [this.configService.get<string>('STRIPE_PRICE_ID_AGENCY_ANNUAL') || '']:
        PlanIdentifier.AGENCY,
    };

    return priceIdToPlan[priceId] || null;
  }
}
