import { HeadingLevel, IUserImage } from './post-interview.interface';

export enum PostStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
}

export enum PostBlockType {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  FAQ = 'faq',
}

export interface BasePostBlock {
  type: PostBlockType;
}

export interface PostHeading extends BasePostBlock {
  level: HeadingLevel;
  title: string;
}

export interface PostParagraph extends BasePostBlock {
  content: string;
}

export interface PostImage extends BasePostBlock {
  image?: IUserImage;
}

export interface PostFAQ extends BasePostBlock {
  questions: string[];
  answers: string[];
}

export type PostBlock = PostHeading | PostParagraph | PostImage | PostFAQ;
