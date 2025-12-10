import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import type { ApplicationUsage } from '../library/usage.interface';

@Schema({ timestamps: true })
export class Usage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
  subscriptionId: Types.ObjectId;

  @Prop({ required: true })
  billingPeriodIdentifier: string; // References the subscription active billing period

  @Prop({ type: Object, required: true })
  usage: ApplicationUsage;
}

export const UsageSchema = SchemaFactory.createForClass(Usage);
