import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import { LLMRequestOptions, LLMResponse } from './types/llm.types';

// Define type for Anthropic's ContentBlock (or adjust import if available)
type ContentBlock =
  | { type: 'text'; text: string }
  | { type: string; [key: string]: unknown };

export enum AnthropicModel {
  CLAUDE_SONNET_4_5 = 'claude-sonnet-4-5-20250929',
}

@Injectable()
export class AntrophicService {
  private readonly logger = new Logger(AntrophicService.name);
  private readonly anthropic: Anthropic;
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTROPHIC_API_KEY');

    if (!apiKey) {
      throw new Error('ANTROPHIC_API_KEY not found in environment variables');
    }

    this.anthropic = new Anthropic({ apiKey });
  }

  async generate(
    prompt: LLMPrompt,
    options: LLMRequestOptions<AnthropicModel>,
  ): Promise<LLMResponse> {
    const {
      model = AnthropicModel.CLAUDE_SONNET_4_5,
      // temperature = 0.7,
      maxTokens = 1024,
    } = options;

    // Use union type so "role" is properly typed
    const messages: MessageParam[] = [
      ...prompt.systemPrompts.map(
        (prompt): MessageParam => ({
          role: 'user', // Anthropic API only supports 'user' and 'assistant'
          content: prompt,
        }),
      ),
      ...prompt.userPrompts.map(
        (prompt): MessageParam => ({
          role: 'user',
          content: prompt,
        }),
      ),
    ];

    const completion = await this.anthropic.messages.create({
      model,
      messages,
      // temperature: temperature,
      max_tokens: maxTokens,
    });

    let content = '';
    if (Array.isArray(completion.content)) {
      content = (completion.content as ContentBlock[])
        .filter(
          (block): block is { type: 'text'; text: string } =>
            block.type === 'text' && typeof block.text === 'string',
        )
        .map((block) => block.text)
        .join('');
    }

    return {
      content,
      model: completion.model,
    };
  }
}
