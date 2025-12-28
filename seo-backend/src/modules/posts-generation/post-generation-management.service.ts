import { Injectable } from '@nestjs/common';
import { PostInterview } from '../posts-management/schemas/post-interview.schema';
import { buildPipelineId } from './library/interfaces/pipelines/pipeline-ids.util';
import { AvailablePipelines } from './library/interfaces/pipelines/pipeline.interface';
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

  async getGenerationContext(postInterview: PostInterview) {
    const pipelineId = buildPipelineId(
      AvailablePipelines.GENERATE_POST_PIPELINE,
      postInterview.interviewId,
    );

    return this.pipelineOrchestrator.getContextForPipeline<GeneratePostPipeline_Context>(
      pipelineId,
    );
  }

  async generatePostFromInterview(postInterview: PostInterview) {
    const existingGenerationContext =
      await this.getGenerationContext(postInterview);
    if (existingGenerationContext) {
      throw new Error("There's already a creation pipeline for this interview");
    }

    const pipelineId =
      await this.generatePostPipeline.initialize(postInterview);
    await this.pipelineOrchestrator.enqueuePipelineStep(pipelineId);
  }
}
