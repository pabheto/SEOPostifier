import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/users/auth';
import { CurrentUser, RequireLicense } from 'src/modules/users/auth';
import { SubscriptionService } from './subscription.service';
import { UsageService } from './usage.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly usageService: UsageService,
  ) {}

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
}
