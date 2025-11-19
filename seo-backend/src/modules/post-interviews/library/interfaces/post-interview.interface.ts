export enum SearchIntent {
  INFORMATIONAL = 'informational',
  TRANSACTIONAL = 'transactional',
  COMMERCIAL = 'commercial',
  NAVIGATIONAL = 'navigational',
}

export enum InterviewStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ToneOfVoice {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  TECHNICAL = 'technical',
  EDUCATIONAL = 'educational',
  CASUAL = 'casual',
  FORMAL = 'formal',
}

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
}

export enum ImageSourceType {
  URL = 'url',
  WORDPRESS_MEDIA_ID = 'wordpress_media_id',
  OTHER = 'other',
}

/**
 * Interface para la configuración de imágenes
 */
export interface IImagesConfig {
  totalDesiredImages?: number;
  aiImagesCount?: number;
  useUserImages: boolean;
  userImages: IUserImage[];
}

/**
 * Interface para imágenes del usuario
 */
export interface IUserImage {
  sourceType: ImageSourceType;
  sourceValue: string;
  suggestedAlt?: string;
  notes?: string;
}
