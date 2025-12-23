export const GROQ_COMPOUND = 'groq/compound';
export const GROQ_GPT_OSS_120B_MODEL = 'openai/gpt-oss-120b';

export const GROQ_MEDIUM_GENERATION_MODEL = 'llama-3.3-70b-versatile';

export const GROQ_CHEAP_GENERATION_MODEL = 'meta-llama/llama-guard-4-12b';

export type GroqLLMModel =
  | typeof GROQ_COMPOUND
  | typeof GROQ_GPT_OSS_120B_MODEL
  | typeof GROQ_MEDIUM_GENERATION_MODEL
  | typeof GROQ_CHEAP_GENERATION_MODEL;
