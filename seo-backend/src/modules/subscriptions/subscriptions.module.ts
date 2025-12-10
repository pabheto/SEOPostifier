import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSubscription,
  UserSubscriptionSchema,
} from '../users/schemas/subscription.schema';
import { UsersModule } from '../users/users.module';
import { Usage, UsageSchema } from './schemas/usage.schema';
import { SubscriptionService } from './subscription.service';
import { SubscriptionsController } from './subscriptions.controller';
import { UsageService } from './usage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSubscription.name, schema: UserSubscriptionSchema },
      { name: Usage.name, schema: UsageSchema },
    ]),
    UsersModule, // Import UsersModule for license-based authentication
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionService, UsageService],
  exports: [SubscriptionService, UsageService],
})
export class SubscriptionsModule {}
