import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { ImageGenerationModule } from 'src/modules/image-generation/image-generation.module';
import { LlmManagerModule } from 'src/modules/llm-manager/llm-manager.module';
import { PostsManagementModule } from 'src/modules/posts-management/posts-management.module';
import { StorageModule } from 'src/modules/storage';
import { SubscriptionsModule } from 'src/modules/subscriptions/subscriptions.module';
import { PIPELINE_STEP_QUEUE } from './library/constants';
import { GeneratePost_Pipeline } from './pipelines/generate-post.pipeline';
import { PipelineOrchestrator } from './pipelines/pipeline.orchestrator';
import { PostGenerationManagementService } from './post-generation-management.service';
import { PipelineProcessor } from './processors/pipeline.processor';

@Module({
  imports: [
    LlmManagerModule,
    ImageGenerationModule,
    forwardRef(() => PostsManagementModule),
    StorageModule,
    SubscriptionsModule,
    BullModule.registerQueue({
      name: PIPELINE_STEP_QUEUE,
    }),
  ],
  providers: [
    PipelineOrchestrator,
    GeneratePost_Pipeline,
    PipelineProcessor,
    PostGenerationManagementService,
  ],
  exports: [
    PipelineOrchestrator,
    GeneratePost_Pipeline,
    PostGenerationManagementService,
  ],
})
export class PostsGenerationModule {}
