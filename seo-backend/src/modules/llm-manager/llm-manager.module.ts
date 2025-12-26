import { Module } from '@nestjs/common';
import { AntrophicService } from './antrophic.service';
import { ExaService } from './exa.service';
import { GroqService } from './groq.service';
import { OpenaiService } from './openai.service';

@Module({
  controllers: [],
  providers: [GroqService, ExaService, OpenaiService, AntrophicService],
  exports: [GroqService, ExaService, OpenaiService, AntrophicService],
})
export class LlmManagerModule {}
