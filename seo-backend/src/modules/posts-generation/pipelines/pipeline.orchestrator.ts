import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisStorageService } from 'src/modules/storage';
import { RedisKeys } from 'src/modules/storage/library/utils/redis-keys.util';
import { PIPELINE_STEP_QUEUE } from '../library/constants';
import { PipelineStepExecutionException } from '../library/exceptions';
import { getPipelineFromId } from '../library/interfaces/pipelines/pipeline-ids.util';
import { AvailablePipelines } from '../library/interfaces/pipelines/pipeline.interface';
import {
  PipelineProcessor,
  PipelineStepJobData,
} from '../processors/pipeline.processor';
import {
  GeneratePost_Pipeline,
  GeneratePostPipeline_Context,
} from './generate-post.pipeline';

@Injectable()
export class PipelineOrchestrator {
  private readonly logger = new Logger(PipelineOrchestrator.name);
  constructor(
    private readonly redisStorageService: RedisStorageService,
    private readonly pipelineProcessor: PipelineProcessor,
    private readonly generatePostPipeline: GeneratePost_Pipeline,
    @InjectQueue(PIPELINE_STEP_QUEUE)
    private readonly pipelineStepQueue: Queue,
  ) {}

  async getContextForPipeline<T>(pipelineId: string): Promise<T> {
    const pipelineKey = RedisKeys.PIPELINE_ID(pipelineId);
    const pipelineContext = await this.redisStorageService.get(pipelineKey);
    return pipelineContext as T;
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
      this.logger.error(error, 'Error executing pipeline step');
      throw new PipelineStepExecutionException((error as Error).message);
    }

    throw new Error(`Unknown pipeline type: ${pipelineType as string}`);
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
