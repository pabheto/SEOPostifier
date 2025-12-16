import type { RawBodyRequest } from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/users/auth';
import {
  CurrentUser,
  RequireAuth,
  RequireLicense,
} from 'src/modules/users/auth';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { AVAILABLE_PLANS, PlanIdentifier } from './plans/plans.definition';
import { StripeService } from './stripe/stripe.service';
import { SubscriptionService } from './subscription.service';
import { UsageService } from './usage.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly usageService: UsageService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Get('plans')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all available subscription plans',
    description:
      'Returns all available subscription plans with their features and pricing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
  })
  getAvailablePlans() {
    return {
      plans: [
        AVAILABLE_PLANS[PlanIdentifier.FREE],
        AVAILABLE_PLANS[PlanIdentifier.BASIC],
        AVAILABLE_PLANS[PlanIdentifier.PREMIUM],
        AVAILABLE_PLANS[PlanIdentifier.AGENCY],
      ],
    };
  }

  @Get('current')
  @HttpCode(200)
  @RequireAuth()
  @ApiOperation({
    summary: 'Get current subscription plan and usage (JWT-based)',
    description:
      'Returns the current user subscription, billing period, and usage statistics. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription and usage retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getCurrentSubscriptionAndUsage(@CurrentUser() user: AuthenticatedUser) {
    const userId = user.id;
    const subscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(userId);
    const usage =
      await this.usageService.getUsageForCurrentBillingPeriod(userId);

    return {
      subscription: {
        plan: subscription.plan,
        status: subscription.stripeStatus || 'active',
        billingPeriodStart: subscription.billingPeriodStart,
        billingPeriodEnd: subscription.billingPeriodEnd,
      },
      billingPeriod: {
        start: subscription.billingPeriodStart,
        end: subscription.billingPeriodEnd,
      },
      usage,
    };
  }

  @Get('current-by-license')
  @HttpCode(200)
  @RequireLicense()
  @ApiSecurity('license-key')
  @ApiOperation({
    summary: 'Get current subscription plan and usage (License-based)',
    description:
      'Returns the current user subscription, billing period, and usage statistics. Requires license key authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription and usage retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing license key',
  })
  async getCurrentSubscriptionAndUsageByLicense(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = user.id;
    const subscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(userId);
    const usage =
      await this.usageService.getUsageForCurrentBillingPeriod(userId);

    return {
      subscription: {
        plan: subscription.plan,
        status: subscription.stripeStatus || 'active',
        billingPeriodStart: subscription.billingPeriodStart,
        billingPeriodEnd: subscription.billingPeriodEnd,
      },
      billingPeriod: {
        start: subscription.billingPeriodStart,
        end: subscription.billingPeriodEnd,
      },
      usage,
    };
  }

  @Post('checkout')
  @HttpCode(200)
  @RequireAuth()
  @ApiOperation({
    summary: 'Create Stripe checkout session',
    description:
      'Creates a Stripe checkout session for subscribing to a plan. Returns the checkout session URL.',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async createCheckoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const successUrl = `${frontendUrl}/billing?success=true`;
    const cancelUrl = `${frontendUrl}/billing?canceled=true`;

    const session = await this.stripeService.createCheckoutSession(
      user.id,
      user.email,
      createCheckoutDto.plan,
      createCheckoutDto.billingPeriod,
      successUrl,
      cancelUrl,
    );

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Stripe webhook endpoint',
    description:
      'Handles Stripe webhook events for subscription updates, payments, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body is required for webhook verification');
    }

    // Ensure rawBody is a Buffer for Stripe verification
    const bodyBuffer = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(rawBody);

    let event;
    try {
      event = this.stripeService.verifyWebhookSignature(bodyBuffer, signature);
    } catch (error) {
      return {
        error: `Webhook signature verification failed: ${error.message}`,
      };
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription;
          if (subscriptionId) {
            const subscription =
              await this.stripeService.getSubscription(subscriptionId);
            await this.subscriptionService.updateSubscriptionFromStripe(
              subscription,
            );
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await this.subscriptionService.updateSubscriptionFromStripe(
          subscription,
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await this.subscriptionService.cancelSubscription(userId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await this.stripeService.getSubscription(
            invoice.subscription,
          );
          await this.subscriptionService.updateSubscriptionFromStripe(
            subscription,
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed payment - you might want to notify the user
        const invoice = event.data.object as any;
        // Log or handle failed payment
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return { received: true };
  }

  @Post('cancel')
  @HttpCode(200)
  @RequireAuth()
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      'Cancels the current user subscription. The subscription will remain active until the end of the billing period.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async cancelSubscription(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.subscriptionService.cancelSubscription(
      user.id,
    );
    return {
      message: 'Subscription canceled successfully',
      subscription: {
        plan: subscription.plan,
        billingPeriodEnd: subscription.billingPeriodEnd,
      },
    };
  }

  @Get('portal')
  @HttpCode(200)
  @RequireAuth()
  @ApiOperation({
    summary: 'Get customer portal session',
    description:
      'Creates a Stripe customer portal session URL for managing subscriptions, payment methods, and invoices.',
  })
  @ApiResponse({
    status: 200,
    description: 'Portal session created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getCustomerPortalSession(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.subscriptionService.getSubscriptionForUser(
      user.id,
    );

    if (!subscription?.stripeCustomerId) {
      throw new Error('No Stripe customer found for this user');
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/billing`;

    const session = await this.stripeService.createCustomerPortalSession(
      subscription.stripeCustomerId,
      returnUrl,
    );

    return {
      url: session.url,
    };
  }
}
