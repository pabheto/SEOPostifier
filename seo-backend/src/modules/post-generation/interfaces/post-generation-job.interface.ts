/**
 * Content types for post generation jobs
 */
export type PostContentType = 'introduction' | 'section' | 'image' | 'faq';

/**
 * Base interface for post generation job data
 */
export interface BasePostGenerationJobData {
  postId: string;
  interviewId: string;
  userId: string;
  contentType: PostContentType;
  // Common fields used across all content types
  indexSummary: string;
  targetAudience: string;
  toneOfVoice: string;
  language: string;
}

/**
 * Job data for generating post introduction
 */
export interface GenerateIntroductionContentData
  extends BasePostGenerationJobData {
  contentType: 'introduction';
  h1: string;
  introductionDescription: string;
  introductionLengthRange: string;
}

/**
 * Job data for generating a post section
 */
export interface GenerateSectionContentData extends BasePostGenerationJobData {
  contentType: 'section';
  section: {
    title: string;
    level: number;
    requiresDeepResearch: boolean;
    images?: Array<{
      sourceType: 'ai_generated' | 'user';
      sourceValue?: string;
      title?: string;
      description?: string;
      alt?: string;
    }>;
  };
}

/**
 * Job data for generating an image
 */
export interface GenerateImageContentData extends BasePostGenerationJobData {
  contentType: 'image';
  sectionTitle: string;
  image: {
    sourceType: 'ai_generated' | 'user';
    sourceValue?: string;
    title?: string;
    description?: string;
    alt?: string;
  };
}

/**
 * Job data for generating FAQ section
 */
export interface GenerateFaqContentData extends BasePostGenerationJobData {
  contentType: 'faq';
  faq: any; // FAQ definition from script
}

/**
 * Union type for all post content generation job data
 */
export type GeneratePostContentJobData =
  | GenerateIntroductionContentData
  | GenerateSectionContentData
  | GenerateImageContentData
  | GenerateFaqContentData;
