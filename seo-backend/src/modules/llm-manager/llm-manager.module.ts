import { Module } from '@nestjs/common';
import { ExaService } from './exa.service';
import { GroqService } from './groq.service';
import { OpenaiService } from './openai.service';

@Module({
  controllers: [],
  providers: [GroqService, ExaService, OpenaiService],
  exports: [GroqService, ExaService, OpenaiService],
})
export class LlmManagerModule {}
