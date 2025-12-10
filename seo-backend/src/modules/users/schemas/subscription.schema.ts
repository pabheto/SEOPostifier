import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanIdentifier } from '../../subscriptions/plans/plans.definition';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class UserSubscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: PlanIdentifier })
  plan: PlanIdentifier;

  @Prop({
    required: true,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Prop({ required: true })
  billingPeriodStart: Date;

  @Prop({ required: true })
  billingPeriodEnd: Date;
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);
