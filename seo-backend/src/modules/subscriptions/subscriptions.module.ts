import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import {
  SubscriptionSchema,
  UserSubscription,
} from './schemas/subscription.schema';
import { Usage, UsageSchema } from './schemas/usage.schema';
import { StripeService } from './stripe/stripe.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionsController } from './subscriptions.controller';
import { UsageService } from './usage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSubscription.name, schema: SubscriptionSchema },
      { name: Usage.name, schema: UsageSchema },
    ]),
    forwardRef(() => UsersModule), // Import UsersModule for JWT and license-based authentication
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionService, UsageService, StripeService],
  exports: [SubscriptionService, UsageService],
})
export class SubscriptionsModule {}
