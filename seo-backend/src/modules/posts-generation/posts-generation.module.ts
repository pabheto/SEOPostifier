import { Module } from '@nestjs/common';
import { LlmManagerModule } from '../llm-manager';
import { PostScriptsGenerator } from './library/generation/post-scripts.generator';

@Module({
  imports: [LlmManagerModule],
  providers: [PostScriptsGenerator],
  exports: [PostScriptsGenerator],
})
export class PostsGenerationModule {}
