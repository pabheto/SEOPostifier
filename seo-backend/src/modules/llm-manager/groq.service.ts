import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

import { GROQ_MEDIUM_GENERATION_MODEL } from './llm.constants';
import { LLMRequestOptions, LLMResponse } from './types/llm.types';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

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
   * @param prompt - The user prompt/message (or combined prompt if options.userPrompt not specified)
   * @param options - Optional configuration for the request
   * @returns LLMResponse with generated content and metadata
   */
  async generate(
    prompt: string,
    options: LLMRequestOptions = {},
  ): Promise<LLMResponse> {
    const {
      model = GROQ_MEDIUM_GENERATION_MODEL,
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1,
      systemPrompt,
      userPrompt,
    } = options;

    this.logger.debug(`Generating completion with model: ${model}`);

    try {
      const messages: ChatCompletionMessageParam[] = [];

      // Add system prompt(s) if provided
      if (systemPrompt) {
        const systemPrompts = Array.isArray(systemPrompt)
          ? systemPrompt
          : [systemPrompt];
        systemPrompts.forEach((sysPrompt) => {
          if (sysPrompt.trim()) {
            messages.push({
              role: 'system',
              content: sysPrompt,
            });
          }
        });
      }

      // Add user prompt(s)
      // If userPrompt is provided in options, use it; otherwise use the prompt parameter
      const userPrompts = userPrompt
        ? Array.isArray(userPrompt)
          ? userPrompt
          : [userPrompt]
        : [prompt];

      userPrompts.forEach((usrPrompt) => {
        if (usrPrompt.trim()) {
          messages.push({
            role: 'user',
            content: usrPrompt,
          });
        }
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
        `Failed to generate completion for model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
