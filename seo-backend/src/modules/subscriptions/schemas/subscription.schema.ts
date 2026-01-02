import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlanIdentifier } from '../plans/plans.definition';

@Schema({ timestamps: true })
export class UserSubscription extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  appUserId: string;

  @Prop({ required: true })
  plan: PlanIdentifier;

  @Prop({ required: true })
  billingPeriodStart: Date;

  @Prop({ required: true })
  billingPeriodEnd: Date;

  @Prop({ type: String, required: false })
  stripeCustomerId?: string;

  @Prop({ type: String, required: false })
  stripeSubscriptionId?: string;

  @Prop({ type: String, required: false })
  stripePriceId?: string;

  @Prop({ type: String, required: false })
  stripeStatus?: string; // active, canceled, past_due, etc.
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);
