import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class License extends Document {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: false })
  activated?: boolean;

  @Prop({ default: null })
  activatedForSite?: string; // url of the site of the activation

  @Prop({ default: null })
  activatedAt?: Date;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
