import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LicenseRole {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

@Schema({ timestamps: true })
export class License extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: LicenseRole, default: LicenseRole.BASIC })
  role: LicenseRole;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: true })
  active: boolean;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
