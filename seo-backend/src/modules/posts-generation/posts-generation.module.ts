import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { LlmManagerModule } from 'src/modules/llm-manager/llm-manager.module';
import { StorageModule } from 'src/modules/storage';
import { PIPELINE_STEP_QUEUE } from './library/constants';
import { GeneratePost_Pipeline } from './pipelines/generate-post.pipeline';
import { PipelineOrchestrator } from './pipelines/pipeline.orchestrator';
import { PipelineProcessor } from './processors/pipeline.processor';

@Module({
  imports: [
    LlmManagerModule,
    StorageModule,
    BullModule.registerQueue({
      name: PIPELINE_STEP_QUEUE,
    }),
  ],
  providers: [PipelineOrchestrator, GeneratePost_Pipeline, PipelineProcessor],
  exports: [PipelineOrchestrator, GeneratePost_Pipeline],
})
export class PostsGenerationModule {}
