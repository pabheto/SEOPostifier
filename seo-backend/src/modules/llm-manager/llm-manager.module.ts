import { Module } from '@nestjs/common';
import { GroqService } from './groq.service';

@Module({
  controllers: [],
  providers: [GroqService],
  exports: [GroqService],
})
export class LlmManagerModule {}
