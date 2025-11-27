/**
 * Base interface for post generation job data
 */
export interface BasePostGenerationJobData {
  postId: string;
  interviewId: string;
  userId: string;
}

/**
 * Job data for generating a complete post
 */
export interface GeneratePostJobData extends BasePostGenerationJobData {
  postInterviewData: {
    generatedScriptDefinition: any;
    targetAudience: string;
    toneOfVoice: string;
    language: string;
  };
}

/**
 * Job data for generating post introduction
 */
export interface GenerateIntroductionJobData extends BasePostGenerationJobData {
  indexSummary: string;
  h1: string;
  introductionDescription: string;
  targetAudience: string;
  toneOfVoice: string;
  language: string;
  introductionLengthRange: string;
}

/**
 * Job data for generating a post section
 */
export interface GenerateSectionJobData extends BasePostGenerationJobData {
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
  indexSummary: string;
  targetAudience: string;
  toneOfVoice: string;
}

/**
 * Job data for generating an image
 */
export interface GenerateImageJobData extends BasePostGenerationJobData {
  imageDescription: string;
  sectionTitle: string;
  image?: {
    title?: string;
    description?: string;
    alt?: string;
  };
}

/**
 * Job data for generating FAQ section
 */
export interface GenerateFaqJobData extends BasePostGenerationJobData {
  indexSummary: string;
  targetAudience: string;
  toneOfVoice: string;
  faq: any;
}

