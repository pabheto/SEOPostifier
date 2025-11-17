import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GroqService } from './groq.service';
import {
  SCRIPT_CREATION_MODEL,
  MEDIUM_GENERATION_MODEL,
  CHEAP_GENERATION_MODEL,
} from './llm.constants';

class GenerateTextDto {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

@ApiTags('llm')
@Controller('llm')
export class LlmManagerController {
  constructor(private readonly groqService: GroqService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate text using LLM',
    description:
      'Generate text completion using Groq API with specified model and parameters',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The text prompt for generation',
          example: 'Write a short article about SEO best practices',
        },
        model: {
          type: 'string',
          description: 'Model to use for generation',
          enum: [
            SCRIPT_CREATION_MODEL,
            MEDIUM_GENERATION_MODEL,
            CHEAP_GENERATION_MODEL,
          ],
          example: MEDIUM_GENERATION_MODEL,
        },
        temperature: {
          type: 'number',
          description: 'Temperature for randomness (0-2)',
          example: 0.7,
        },
        maxTokens: {
          type: 'number',
          description: 'Maximum tokens to generate',
          example: 1024,
        },
        systemPrompt: {
          type: 'string',
          description: 'Optional system prompt to set context',
          example: 'You are an SEO expert and content writer.',
        },
      },
      required: ['prompt'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Text generated successfully',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Generated text content',
        },
        model: {
          type: 'string',
          description: 'Model used for generation',
        },
        usage: {
          type: 'object',
          properties: {
            promptTokens: { type: 'number' },
            completionTokens: { type: 'number' },
            totalTokens: { type: 'number' },
          },
        },
        finishReason: {
          type: 'string',
          description: 'Reason for completion',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Error generating text',
  })
  async generate(@Body() dto: GenerateTextDto) {
    return this.groqService.generate(dto.prompt, {
      model: dto.model as any,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      systemPrompt: dto.systemPrompt,
    });
  }
}
