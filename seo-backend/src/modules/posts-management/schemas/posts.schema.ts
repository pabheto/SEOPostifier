import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PostBlock, PostStatus } from '../library/interfaces/posts.interface';

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  // ============================================
  // Vínculos externos
  // ============================================

  /** ID de la entrevista de origen (string, no ObjectId) */
  @Prop({
    type: String,
    index: true,
  })
  interviewId?: string;

  /** ID del post en WordPress (si está publicado/sincronizado) */
  @Prop({ index: true })
  wordpressPostId?: number;

  /** ID del usuario dueño del post */
  @Prop({ index: true })
  userId?: string;

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

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}
export const PostSchema = SchemaFactory.createForClass(Post);

// Índices útiles
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ wordpressPostId: 1 });
PostSchema.index({ userId: 1, createdAt: -1 });
// Text index without language-specific stemming
PostSchema.index(
  { mainKeyword: 'text', title: 'text' },
  {
    default_language: 'none',
    language_override: 'dummy_language_field', // Use non-existent field to disable language override
  },
);

export type PostDocument = HydratedDocument<Post>;
