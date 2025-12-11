import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanIdentifier } from '../plans/plans.definition';

@Schema({ timestamps: true })
export class UserSubscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  plan: PlanIdentifier;

  @Prop({ required: true })
  billingPeriodStart: Date;

  @Prop({ required: true })
  billingPeriodEnd: Date;
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);
