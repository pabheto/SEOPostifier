import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { MEDIUM_GENERATION_MODEL, type LLMModel } from './llm.constants';

/**
 * Request options for LLM generation
 */
export interface LLMRequestOptions {
  model?: LLMModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
}

/**
 * Response from LLM generation
 */
export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly groq: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'GROQ_API_KEY not found in environment variables. API calls will fail until configured.',
      );
    }

    this.groq = new Groq({
      apiKey: apiKey || 'dummy-key-for-dev',
    });

    if (apiKey) {
      this.logger.log('Groq service initialized successfully');
    }
  }

  /**
   * Generate text completion using Groq API
   *
   * @param prompt - The user prompt/message
   * @param options - Optional configuration for the request
   * @returns LLMResponse with generated content and metadata
   */
  async generate(
    prompt: string,
    options: LLMRequestOptions = {},
  ): Promise<LLMResponse> {
    const {
      model = MEDIUM_GENERATION_MODEL,
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1,
      systemPrompt,
    } = options;

    this.logger.debug(`Generating completion with model: ${model}`);

    try {
      const messages: ChatCompletionMessageParam[] = [];

      // Add system prompt if provided
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // Add user prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      const completion = await this.groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: false,
      });

      const choice = completion.choices[0];
      const usage = completion.usage;

      this.logger.debug(
        `Completion generated successfully. Tokens used: ${usage?.total_tokens || 0}`,
      );

      return {
        content: choice.message.content || '',
        model: completion.model,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason || 'unknown',
      };
    } catch (error) {
      this.logger.error('Error generating completion:', error);
      throw new Error(
        `Failed to generate completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate streaming text completion (for future use)
   *
   * @param prompt - The user prompt/message
   * @param options - Optional configuration for the request
   * @returns AsyncIterable stream of text chunks
   */
  async *generateStream(
    prompt: string,
    options: LLMRequestOptions = {},
  ): AsyncIterable<string> {
    const {
      model = MEDIUM_GENERATION_MODEL,
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1,
      systemPrompt,
    } = options;

    this.logger.debug(`Starting streaming completion with model: ${model}`);

    const messages: ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    try {
      const stream = await this.groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

      this.logger.debug('Streaming completion finished');
    } catch (error) {
      this.logger.error('Error in streaming completion:', error);
      throw new Error(
        `Failed to generate streaming completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate text with conversation history
   *
   * @param messages - Array of conversation messages
   * @param options - Optional configuration for the request
   * @returns LLMResponse with generated content and metadata
   */
  async generateWithHistory(
    messages: ChatCompletionMessageParam[],
    options: LLMRequestOptions = {},
  ): Promise<LLMResponse> {
    const {
      model = MEDIUM_GENERATION_MODEL,
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1,
    } = options;

    this.logger.debug(
      `Generating with conversation history. Messages: ${messages.length}`,
    );

    try {
      const completion = await this.groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: false,
      });

      const choice = completion.choices[0];
      const usage = completion.usage;

      this.logger.debug(
        `Completion generated successfully. Tokens used: ${usage?.total_tokens || 0}`,
      );

      return {
        content: choice.message.content || '',
        model: completion.model,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason || 'unknown',
      };
    } catch (error) {
      this.logger.error('Error generating completion with history:', error);
      throw new Error(
        `Failed to generate completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
