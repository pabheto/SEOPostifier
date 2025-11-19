export enum PostStatus {
  DRAFT = 'draft', // Borrador interno
  OUTLINE = 'outline', // Guión generado (bloques esqueleto)
  GENERATED = 'generated', // Contenido generado completo
  EDITED = 'edited', // Usuario/IA ya ha editado
  READY_TO_PUBLISH = 'ready_to_publish',
  PUBLISHED = 'published', // Sincronizado con WordPress
}

export enum PostBlockType {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  IMAGE = 'image',
  FAQ = 'faq', // 👈 FAQ como un bloque más
  HTML = 'html', // por si necesitas meter algo custom
}

export enum HeadingLevel {
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
}

export enum ImageGenerationStatus {
  PENDING = 'pending',
  GENERATED = 'generated',
  REJECTED = 'rejected',
  REGENERATE = 'regenerate',
}

export enum ImageOrigin {
  AI_GENERATED = 'ai_generated',
  USER_PROVIDED = 'user_provided',
  STOCK = 'stock',
}

export interface PostBlock {
  type: PostBlockType;
  content: string;
}

export interface PostHeading extends PostBlock {
  level?: HeadingLevel;
}

export interface PostParagraph extends PostBlock {
  content: string;
}

export interface PostImage extends PostBlock {
  image?: {
    url: string;
    alt: string;
    generationStatus?: ImageGenerationStatus;
    origin?: ImageOrigin;
  };
}

export interface PostFAQ extends PostBlock {
  questions: string[];
  answers: string[];
}
