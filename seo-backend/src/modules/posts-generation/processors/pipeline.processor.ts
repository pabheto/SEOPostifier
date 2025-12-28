import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PIPELINE_STEP_QUEUE } from '../library/constants';
import {
  BasePipelineContext,
  PipelineStepOutcome,
} from '../library/interfaces/pipelines/pipeline.interface';
import { PipelineOrchestrator } from '../pipelines/pipeline.orchestrator';

export interface PipelineStepJobData {
  pipelineId: string;
  kind: 'STEP' | 'CANCEL';
}

export type PipelineStepJob = Job<PipelineStepJobData, any, string>;

const MAX_HOPS_PER_TICK = 5;

@Processor(PIPELINE_STEP_QUEUE, {
  concurrency: 10,
})
export class PipelineProcessor extends WorkerHost {
  private readonly logger = new Logger(PipelineProcessor.name);

  constructor(private readonly pipelineOrchestrator: PipelineOrchestrator) {
    super();
  }

  async process(job: PipelineStepJob) {
    this.logger.log(`Processing job ${job.name} with ID: ${job.id}`);
    try {
      let hops = 0;
      let lastStep: any = null;

      while (true) {
        let outcome: PipelineStepOutcome;
        try {
          outcome = await this.pipelineOrchestrator.executeStepForPipelineId(
            job.data.pipelineId,
          );
        } catch (error) {
          // TODO: Implement a retry mechanism here
          this.logger.error('Error executing pipeline step ' + error);
          break;
        }

        if (outcome.type === 'PROGRESSED') {
          hops++;
          const newContext =
            await this.pipelineOrchestrator.getContextForPipeline<BasePipelineContext>(
              job.data.pipelineId,
            );
          const newStep = newContext.step;

          if (lastStep === newStep) {
            throw new Error('INTEGRITY ERROR: Step is not updated in pipeline');
          }
          lastStep = newStep;

          if (hops >= MAX_HOPS_PER_TICK) {
            await this.pipelineOrchestrator.enqueuePipelineStep(
              job.data.pipelineId,
            );
            break;
          }

          // sigue en el mismo tick bajo el mismo lock
          continue;
        }

        if (outcome.type === 'RETRY_AFTER') {
          await this.pipelineOrchestrator.enqueuePipelineStep(
            job.data.pipelineId,
            {
              delayMs: outcome.ms,
            },
          );

          break;
        }

        if (outcome.type === 'WAITING_EXTERNAL') {
          break;
        }

        if (outcome.type === 'TERMINAL') {
          break;
        }

        // Si por cualquier razón llega un tipo no reconocido, corta.
        break;
      }
    } catch (error) {
      this.logger.error(error, 'Unexpected error executing pipeline step');
    }
  }
}
