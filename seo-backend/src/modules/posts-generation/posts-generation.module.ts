import { Module } from '@nestjs/common';
import { LlmManagerModule } from '../llm-manager';
import { GeneratePostScript_Pipeline } from './pipelines/generate-post-script.pipeline';

@Module({
  imports: [LlmManagerModule],
  providers: [GeneratePostScript_Pipeline],
  exports: [GeneratePostScript_Pipeline],
})
export class PostsGenerationModule {}
