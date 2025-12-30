import { Module } from '@nestjs/common';
import { AntrophicService } from './antrophic.service';
import { DeepseekService } from './deep-seek.service';
import { ExaService } from './exa.service';
import { GroqService } from './groq.service';
import { OpenaiService } from './openai.service';

@Module({
  controllers: [],
  providers: [
    GroqService,
    ExaService,
    OpenaiService,
    AntrophicService,
    DeepseekService,
  ],
  exports: [
    GroqService,
    ExaService,
    OpenaiService,
    AntrophicService,
    DeepseekService,
  ],
})
export class LlmManagerModule {}
