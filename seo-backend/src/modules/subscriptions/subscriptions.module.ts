import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Usage, UsageSchema } from './schemas/usage.schema';
import { SubscriptionService } from './subscription.service';
import { SubscriptionsController } from './subscriptions.controller';
import { UsageService } from './usage.service';
import { Subscription } from 'rxjs';
import { SubscriptionSchema } from './schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Usage.name, schema: UsageSchema },
    ]),
    UsersModule, // Import UsersModule for license-based authentication
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionService, UsageService],
  exports: [SubscriptionService, UsageService],
})
export class SubscriptionsModule {}
