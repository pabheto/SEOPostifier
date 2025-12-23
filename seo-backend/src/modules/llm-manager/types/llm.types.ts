export interface LLMRequestOptions<AvailableModels extends string = string> {
  model?: AvailableModels;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string | string[];
  userPrompt?: string | string[];
}

/**
 * Response from LLM generation
 */
export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}
