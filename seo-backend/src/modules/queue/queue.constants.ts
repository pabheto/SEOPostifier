/**
 * Queue names for BullMQ
 */
export const QUEUE_NAMES = {
  POST_GENERATION: 'post-generation',
  POST_SECTION_GENERATION: 'post-section-generation',
  POST_IMAGE_GENERATION: 'post-image-generation',
  POST_INTRODUCTION_GENERATION: 'post-introduction-generation',
  POST_FAQ_GENERATION: 'post-faq-generation',
} as const;

/**
 * Job names for different post generation tasks
 */
export const JOB_NAMES = {
  GENERATE_POST: 'generate-post',
  GENERATE_INTRODUCTION: 'generate-introduction',
  GENERATE_SECTION: 'generate-section',
  GENERATE_IMAGE: 'generate-image',
  GENERATE_FAQ: 'generate-faq',
} as const;
