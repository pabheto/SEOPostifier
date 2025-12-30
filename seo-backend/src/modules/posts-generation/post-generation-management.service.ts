import { Injectable } from '@nestjs/common';
import { PostInterview } from '../posts-management/schemas/post-interview.schema';
import { buildPipelineId } from './library/pipelines/pipeline-ids.util';
import {
  PipelineHighLevelStatus,
  PipelineVerbosedStatus,
} from './library/pipelines/pipeline-status.interface';
import {
  AvailablePipelines,
  BasePipelineStep,
} from './library/pipelines/pipeline.interface';
import {
  GeneratePost_Pipeline,
  GeneratePostPipeline_Context,
} from './pipelines/generate-post.pipeline';
import { PipelineOrchestrator } from './pipelines/pipeline.orchestrator';

@Injectable()
export class PostGenerationManagementService {
  constructor(
    private readonly pipelineOrchestrator: PipelineOrchestrator,
    private readonly generatePostPipeline: GeneratePost_Pipeline,
  ) {}

  async getGenerationContext_PostInterview(postInterview: PostInterview) {
    const pipelineId = buildPipelineId(
      AvailablePipelines.GENERATE_POST_PIPELINE,
      postInterview.interviewId,
    );

    return this.pipelineOrchestrator.getContextForPipeline<GeneratePostPipeline_Context>(
      pipelineId,
    );
  }

  async scheduleGeneration_PostInterview(postInterview: PostInterview) {
    const existingGenerationContext =
      await this.getGenerationContext_PostInterview(postInterview);
    /* if (existingGenerationContext) {
      throw new Error("There's already a creation pipeline for this interview");
    } */
    if (existingGenerationContext) {
      return this.pipelineOrchestrator.restartAndEnqueuePipelineFromBeginning(
        existingGenerationContext.pipelineId,
      );
    }

    const pipelineId =
      await this.generatePostPipeline.initialize(postInterview);
    await this.pipelineOrchestrator.enqueuePipelineStep(pipelineId);
  }

  async getGenerationStatus_PostInterview(
    postInterview: PostInterview,
  ): Promise<PipelineVerbosedStatus> {
    const generationContext =
      await this.getGenerationContext_PostInterview(postInterview);

    if (!generationContext) {
      return {
        status: PipelineHighLevelStatus.NOT_STARTED,
        statusLabel: 'Not started',
      };
    }

    if (generationContext.step === BasePipelineStep.COMPLETED) {
      return {
        status: PipelineHighLevelStatus.COMPLETED,
        progress: 100,
        statusLabel: 'Completed',
      };
    }

    if (generationContext.step === BasePipelineStep.CANCELLED) {
      return {
        status: PipelineHighLevelStatus.CANCELLED,
        statusLabel: 'Cancelled',
      };
    }

    if (generationContext.step === BasePipelineStep.FAILED) {
      return {
        status: PipelineHighLevelStatus.FAILED,
        statusLabel: 'Failed',
      };
    }

    return {
      status: PipelineHighLevelStatus.IN_PROGRESS,
      statusLabel: 'In progress',
    };
  }
}
