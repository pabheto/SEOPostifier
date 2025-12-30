import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMPrompt } from 'src/library/types/llm-prompts.types';
import { LLMRequestOptions, LLMResponse } from './types/llm.types';

export enum DeepseekModel {
  DEEPSEEK_CHAT = 'deepseek-chat',
  DEEPSEEK_R1 = 'deepseek-reasoner',
}

@Injectable()
export class DeepseekService {
  private readonly openai: OpenAI;
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY not found in environment variables');
    }

    this.openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });
  }

  async generate(
    prompt: LLMPrompt,
    options: LLMRequestOptions<DeepseekModel>,
  ): Promise<LLMResponse> {
    const {
      model = DeepseekModel.DEEPSEEK_CHAT,
      // temperature = 0.7,
      maxTokens = 4096,
    } = options;

    const systemMessages = (prompt.systemPrompts ?? [])
      .filter((p) => typeof p === 'string' && !!p.trim())
      .map((systemPrompt) => ({
        role: 'system' as const,
        content: systemPrompt,
      }));

    const userMessages = (prompt.userPrompts ?? [])
      .filter((p) => typeof p === 'string' && !!p.trim())
      .map((userPrompt) => ({
        role: 'user' as const,
        content: userPrompt,
      }));

    const allMessages = [...systemMessages, ...userMessages];

    const completion = await this.openai.chat.completions.create({
      model: model,
      messages: allMessages,
      // temperature: temperature,
      max_completion_tokens: maxTokens,
    });

    const choice = completion.choices?.[0];
    const content = choice?.message?.content ?? '';

    return {
      content,
      model: completion.model,
    };
  }
}
