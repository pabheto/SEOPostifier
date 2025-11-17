import { Module } from '@nestjs/common';
import { GroqService } from './groq.service';
import { LlmManagerController } from './llm-manager.controller';

@Module({
  controllers: [LlmManagerController],
  providers: [GroqService],
  exports: [GroqService],
})
export class LlmManagerModule {}
