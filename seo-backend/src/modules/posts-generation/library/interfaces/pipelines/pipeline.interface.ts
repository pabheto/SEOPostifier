import { RedisStorageService } from 'src/modules/storage';
import { RedisKeys } from 'src/modules/storage/library/utils/redis-keys.util';

export enum BasePipelineStep {
  INIT = 'INIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface BasePipelineContext<S extends string = BasePipelineStep> {
  pipelineId: string;
  startedAt: Date;
  step: S;
}

export abstract class Pipeline<TContext extends BasePipelineContext<string>> {
  constructor(private readonly redisStorageService: RedisStorageService) {}

  protected async updateContext(pipelineId: string, context: TContext) {
    await this.redisStorageService.set(
      RedisKeys.PIPELINE_ID(pipelineId),
      context,
    );
  }
}
