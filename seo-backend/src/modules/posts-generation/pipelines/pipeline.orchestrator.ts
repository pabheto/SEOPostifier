import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisStorageService } from 'src/modules/storage';
import { RedisKeys } from 'src/modules/storage/library/utils/redis-keys.util';
import { PIPELINE_STEP_QUEUE } from '../library/constants';
import { PipelineStepExecutionException } from '../library/exceptions';
import { getPipelineFromId } from '../library/pipelines/pipeline-ids.util';
import { PipelineHighLevelStatus } from '../library/pipelines/pipeline-status.interface';
import {
  AvailablePipelines,
  BasePipelineContext,
  BasePipelineStep,
} from '../library/pipelines/pipeline.interface';
import { PipelineStepJobData } from '../processors/pipeline.processor';
import {
  GeneratePost_Pipeline,
  GeneratePostPipeline_Context,
} from './generate-post.pipeline';

@Injectable()
export class PipelineOrchestrator {
  private readonly logger = new Logger(PipelineOrchestrator.name);
  constructor(
    private readonly redisStorageService: RedisStorageService,
    private readonly generatePostPipeline: GeneratePost_Pipeline,
    @InjectQueue(PIPELINE_STEP_QUEUE)
    private readonly pipelineStepQueue: Queue,
  ) {}

  async getContextForPipeline<T>(pipelineId: string): Promise<T> {
    const pipelineKey = RedisKeys.PIPELINE_ID(pipelineId);
    const pipelineContext = await this.redisStorageService.get(pipelineKey);
    return pipelineContext as T;
  }
  async updateContextForPipeline<T extends BasePipelineContext>(
    pipelineId: string,
    context: T,
  ) {
    const pipelineKey = RedisKeys.PIPELINE_ID(pipelineId);
    await this.redisStorageService.set(pipelineKey, {
      ...context,
    });
  }

  async executeStepForPipelineId(pipelineId: string) {
    const pipelineType = getPipelineFromId(pipelineId);

    try {
      if (pipelineType === AvailablePipelines.GENERATE_POST_PIPELINE) {
        const pipelineContext =
          await this.getContextForPipeline<GeneratePostPipeline_Context>(
            pipelineId,
          );
        return this.generatePostPipeline.runOnce(pipelineContext);
      }
    } catch (error) {
      const pipelineContext =
        await this.getContextForPipeline<BasePipelineContext>(pipelineId);
      this.logger.error(
        error,
        `Error executing pipeline step ${pipelineContext.step}`,
      );
      throw new PipelineStepExecutionException((error as Error).message);
    }

    throw new Error(`Unknown pipeline type: ${pipelineType as string}`);
  }

  async markPipelineAsCompleted(pipelineId: string) {
    const pipelineContext =
      await this.getContextForPipeline<BasePipelineContext>(pipelineId);
    pipelineContext.status = PipelineHighLevelStatus.COMPLETED;
    await this.updateContextForPipeline(pipelineId, pipelineContext);
  }

  async markPipelineAsCancelled(pipelineId: string) {
    const pipelineContext =
      await this.getContextForPipeline<BasePipelineContext>(pipelineId);
    pipelineContext.status = PipelineHighLevelStatus.CANCELLED;
    await this.updateContextForPipeline(pipelineId, pipelineContext);
  }

  async markPipelineAsFailed(pipelineId: string, errorMessage?: string) {
    const pipelineContext =
      await this.getContextForPipeline<BasePipelineContext>(pipelineId);
    pipelineContext.status = PipelineHighLevelStatus.FAILED;
    pipelineContext.lastError = errorMessage;
    await this.updateContextForPipeline(pipelineId, pipelineContext);
  }

  async restartAndEnqueuePipelineFromBeginning(pipelineId: string) {
    const pipelineContext =
      await this.getContextForPipeline<BasePipelineContext>(pipelineId);
    pipelineContext.status = PipelineHighLevelStatus.NOT_STARTED;
    pipelineContext.step = BasePipelineStep.INIT;

    await this.updateContextForPipeline(pipelineId, pipelineContext);
    await this.enqueuePipelineStep(pipelineId);
  }

  async enqueuePipelineStep(
    pipelineId: string,
    settings?: {
      delayMs?: number;
    },
  ) {
    const jobData: PipelineStepJobData = {
      pipelineId,
      kind: 'STEP',
    };
    await this.pipelineStepQueue.add(PIPELINE_STEP_QUEUE, jobData, {
      delay: settings?.delayMs,
    });
  }
}
