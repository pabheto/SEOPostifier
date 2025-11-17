import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop()
  excerpt?: string;

  @Prop({ default: 'draft', enum: ['draft', 'published', 'scheduled'] })
  status: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: Object })
  seoAnalysis?: {
    score: number;
    readability: number;
    keywordDensity: number;
    recommendations: string[];
  };

  @Prop()
  featuredImageUrl?: string;

  @Prop()
  author?: string;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  wordpressPostId?: number;

  @Prop({ type: Date })
  publishedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Add indexes for better query performance
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ keywords: 1 });
