import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import type { ScriptFormatDefinition } from '../library/interfaces/post-interview.interface';
import {
  InterviewStatus,
  SearchIntent,
  ToneOfVoice,
} from '../library/interfaces/post-interview.interface';
import { Post } from './posts.schema';
/**
 * Subdocumento para imágenes aportadas por el usuario
 */
@Schema({ _id: false })
export class UserImage {
  /** Tipo de fuente de la imagen */
  @Prop({
    type: String,
  })
  sourceType: string;

  /** Valor de la fuente (URL, ID de WordPress, etc.) */
  @Prop({ required: true })
  sourceValue: string;

  /** Texto ALT sugerido para la imagen */
  @Prop()
  suggestedAlt?: string;

  /** Notas adicionales para la IA o editor */
  @Prop()
  notes?: string;
}

const UserImageSchema = SchemaFactory.createForClass(UserImage);

/**
 * Subdocumento para la configuración de imágenes del post
 */
@Schema({ _id: false })
export class ImagesConfig {
  /** Cuántas imágenes debe generar la IA */
  @Prop({ min: 0, default: 0 })
  aiImagesCount?: number;

  /** Si el usuario aportará imágenes propias */
  @Prop({ default: false })
  useUserImages: boolean;

  /** Array de imágenes aportadas por el usuario */
  @Prop({ type: [UserImageSchema], default: [] })
  userImages: UserImage[];
}

const ImagesConfigSchema = SchemaFactory.createForClass(ImagesConfig);

/**
 * Schema principal para la entrevista inicial del post
 */
@Schema({ timestamps: true, collection: 'post_interviews' })
export class PostInterview {
  // ============================================
  // SECCIÓN 1: Datos SEO y de contenido
  // ============================================

  /** Palabra clave principal del post */
  @Prop({ required: true, index: true })
  mainKeyword: string;

  /** Lista de palabras clave secundarias o variaciones */
  @Prop({ type: [String], default: [] })
  secondaryKeywords: string[];

  /** Descripción del usuario de lo que quiere tratar en este post */
  @Prop({ maxlength: 300 })
  userDescription?: string;

  /** Densidad objetivo de palabra clave (ej: 0.017 para 1.7%) */
  @Prop({ min: 0, max: 1, default: 0.017 })
  keywordDensityTarget: number;

  /** Idioma del post (ISO 639-1: "es", "en", etc.) */
  @Prop({ required: true, index: true })
  language: string;

  /** Intención de búsqueda del contenido */
  @Prop({
    type: String,
    enum: SearchIntent,
    required: true,
    index: true,
  })
  searchIntent: SearchIntent;

  /** Descripción del público objetivo */
  @Prop({ required: true })
  targetAudience: string;

  /** Tono de voz del contenido */
  @Prop({
    type: String,
    enum: ToneOfVoice,
    required: true,
  })
  toneOfVoice: ToneOfVoice;

  /** Mínimo de palabras deseadas */
  @Prop({ min: 100 })
  minWordCount?: number;

  /** Máximo de palabras deseadas */
  @Prop({ min: 100 })
  maxWordCount?: number;

  /** Si incluir sección FAQ */
  @Prop({ default: true })
  needsFaqSection: boolean;

  /** Si mencionar una marca específica */
  @Prop({ default: false })
  mentionsBrand: boolean;

  /** Nombre de la marca a mencionar */
  @Prop()
  brandName?: string;

  /** Descripción/contexto de la marca */
  @Prop()
  brandDescription?: string;

  // ============================================
  // SECCIÓN 2: Configuración de imágenes
  // ============================================

  /** Configuración completa de imágenes */
  @Prop({ type: ImagesConfigSchema, default: () => ({}) })
  imagesConfig: ImagesConfig;

  // ============================================
  // SECCIÓN 3: Preferencias estructurales
  // ============================================

  /** Si incluir sugerencias de enlaces internos */
  @Prop({ default: false })
  includeInternalLinks: boolean;

  /** Si incluir enlaces externos de autoridad */
  @Prop({ default: false })
  includeExternalLinks: boolean;

  /** Enlaces internos a usar */
  @Prop({ type: [String], default: [] })
  internalLinksToUse?: string[];

  /** Enlaces externos a usar */
  @Prop({ type: [String], default: [] })
  externalLinksToUse?: string[];

  /** Máximo de enlaces externos */
  @Prop({ min: 0 })
  maxExternalLinks?: number;

  /** Máximo de enlaces internos */
  @Prop({ min: 0 })
  maxInternalLinks?: number;

  /** Notas adicionales para el redactor/IA */
  @Prop({ type: String })
  notesForWriter?: string;

  // ============================================
  // SECCIÓN 4: Metadatos y estado
  // ============================================

  /** Estado actual de la entrevista */
  @Prop({
    type: String,
    enum: InterviewStatus,
    default: InterviewStatus.DRAFT,
    index: true,
  })
  status: InterviewStatus;

  /** ID lógico del proyecto/cliente/web */
  @Prop({ index: true })
  projectId?: string;

  /** ID del usuario dueño de la entrevista */
  @Prop({ index: true })
  userId?: string;

  /** Referencia al Post generado (cuando se cree) */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post' })
  associatedPostId?: Post;

  // ============================================
  // SECCIÓN 5: Generación del conenido
  // ============================================

  @Prop({ type: String })
  promptToGenerateScript?: string;

  @Prop({ type: String })
  generatedScriptText?: string;

  @Prop({ type: Object })
  generatedScriptDefinition?: ScriptFormatDefinition;
}

const PostInterviewSchema = SchemaFactory.createForClass(PostInterview);

// ============================================
// ÍNDICES para optimización de consultas
// ============================================

// Índice compuesto para búsquedas comunes
PostInterviewSchema.index({ status: 1, userId: 1, createdAt: -1 });
PostInterviewSchema.index({ projectId: 1, status: 1 });

// Índice de texto para búsqueda en contenido
PostInterviewSchema.index({
  mainKeyword: 'text',
  tentativeTitle: 'text',
  targetAudience: 'text',
});

// Índice para búsquedas por fechas
PostInterviewSchema.index({ createdAt: -1 });
PostInterviewSchema.index({ completedAt: -1 });

// Índice para búsquedas por estado y completitud
PostInterviewSchema.index({ isComplete: 1, status: 1 });

// Índice para palabras clave secundarias (multikey index)
PostInterviewSchema.index({ secondaryKeywords: 1 });

export type PostInterviewDocument = HydratedDocument<PostInterview>;
export type ImagesConfigDocument = HydratedDocument<ImagesConfig>;
export type UserImageDocument = HydratedDocument<UserImage>;

export { ImagesConfigSchema, PostInterviewSchema, UserImageSchema };
