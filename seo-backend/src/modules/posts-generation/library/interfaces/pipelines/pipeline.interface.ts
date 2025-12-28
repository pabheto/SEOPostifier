import { RedisStorageService } from 'src/modules/storage';
import { RedisKeys } from 'src/modules/storage/library/utils/redis-keys.util';

export enum AvailablePipelines {
  GENERATE_POST_PIPELINE = 'GENERATE_POST_PIPELINE',
}

export enum BasePipelineStep {
  INIT = 'INIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export type PipelineStepOutcome =
  | { type: 'PROGRESSED' }
  | { type: 'RETRY_AFTER'; ms: number }
  | { type: 'WAITING_EXTERNAL' }
  | { type: 'TERMINAL' };

export interface BasePipelineContext<S extends string = BasePipelineStep> {
  pipelineType: AvailablePipelines;
  pipelineId: string;
  startedAt: Date;
  step: S;
}

export abstract class Pipeline<TContext extends BasePipelineContext<string>> {
  constructor(
    private readonly redisStorageService: RedisStorageService,
    private readonly pipelineType: AvailablePipelines,
  ) {}

  protected async updateContext(pipelineId: string, context: TContext) {
    await this.redisStorageService.set(RedisKeys.PIPELINE_ID(pipelineId), {
      ...context,
    });
  }

  abstract runOnce(context: TContext): Promise<PipelineStepOutcome>;
}
