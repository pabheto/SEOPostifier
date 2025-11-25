export const GROQ_COMPOUND = 'groq/compound';
export const GPT_OSS_120B_MODEL = 'openai/gpt-oss-120b';

export const MEDIUM_GENERATION_MODEL = 'llama-3.3-70b-versatile';

export const CHEAP_GENERATION_MODEL = 'meta-llama/llama-guard-4-12b';

export type LLMModel =
  | typeof GROQ_COMPOUND
  | typeof GPT_OSS_120B_MODEL
  | typeof MEDIUM_GENERATION_MODEL
  | typeof CHEAP_GENERATION_MODEL;
