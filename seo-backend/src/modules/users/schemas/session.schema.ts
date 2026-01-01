import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
