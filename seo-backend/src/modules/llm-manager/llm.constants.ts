/**
 * LLM Model Constants
 *
 * Defines the different models available through Groq API
 * with their specific use cases and capabilities.
 */

/**
 * Model for script and content creation
 * Best for: Complex content generation, detailed articles
 */
export const SCRIPT_CREATION_MODEL = 'openai/gpt-oss-120b';

/**
 * Medium-tier model for general generation tasks
 * Best for: Balanced performance and quality, general content generation
 */
export const MEDIUM_GENERATION_MODEL = 'llama-3.3-70b-versatile';

/**
 * Cost-effective model for simple generation tasks
 * Best for: Content moderation, simple classifications, quick responses
 */
export const CHEAP_GENERATION_MODEL = 'meta-llama/llama-guard-4-12b';

/**
 * All available models
 */
export const LLM_MODELS = {
  SCRIPT_CREATION: SCRIPT_CREATION_MODEL,
  MEDIUM_GENERATION: MEDIUM_GENERATION_MODEL,
  CHEAP_GENERATION: CHEAP_GENERATION_MODEL,
} as const;

/**
 * Model type definition
 */
export type LLMModel = typeof SCRIPT_CREATION_MODEL
  | typeof MEDIUM_GENERATION_MODEL
  | typeof CHEAP_GENERATION_MODEL;
