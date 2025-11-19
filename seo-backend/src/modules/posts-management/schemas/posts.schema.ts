import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { PostBlock, PostStatus } from '../library/interfaces/posts.interface';
import { PostInterview } from './post-interview.schema';

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  // ============================================
  // Vínculos externos
  // ============================================

  /** Referencia a la entrevista de origen */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PostInterview',
    index: true,
  })
  interviewId?: PostInterview;

  /** ID del post en WordPress (si está publicado/sincronizado) */
  @Prop({ index: true })
  wordpressPostId?: number;

  /** Estado actual del post dentro de tu sistema */
  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.DRAFT,
    index: true,
  })
  status: PostStatus;

  // ============================================
  // Datos SEO / básicos
  // ============================================

  @Prop({ required: true })
  title: string;

  @Prop()
  slug?: string;

  @Prop({ index: true })
  language?: string;

  @Prop({ index: true })
  mainKeyword?: string;

  @Prop({ type: [String], default: [], index: true })
  secondaryKeywords?: string[];

  // ============================================
  // Contenido estructurado por bloques
  // ============================================

  /** Array ordenado de bloques que componen el post */
  @Prop({ default: [] })
  blocks?: PostBlock[];
}
export const PostSchema = SchemaFactory.createForClass(Post);

// Índices útiles
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ wordpressPostId: 1 });
PostSchema.index({ mainKeyword: 'text', title: 'text' });

export type PostDocument = HydratedDocument<Post>;
