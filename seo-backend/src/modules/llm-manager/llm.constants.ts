export const SCRIPT_CREATION_MODEL = 'groq/compound';
export const GPT_OSS_120B_MODEL = 'openai/gpt-oss-120b';

export const MEDIUM_GENERATION_MODEL = 'llama-3.3-70b-versatile';

export const CHEAP_GENERATION_MODEL = 'meta-llama/llama-guard-4-12b';

export type LLMModel =
  | typeof SCRIPT_CREATION_MODEL
  | typeof GPT_OSS_120B_MODEL
  | typeof MEDIUM_GENERATION_MODEL
  | typeof CHEAP_GENERATION_MODEL;
