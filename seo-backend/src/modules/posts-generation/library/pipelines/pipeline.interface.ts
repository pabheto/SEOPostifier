import { RedisStorageService } from 'src/modules/storage';
import { RedisKeys } from 'src/modules/storage/library/utils/redis-keys.util';
import { PipelineHighLevelStatus } from './pipeline-status.interface';

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
  status: PipelineHighLevelStatus;
  lastError?: string;
}

export abstract class Pipeline<TContext extends BasePipelineContext<string>> {
  constructor(
    private readonly redisStorageService: RedisStorageService,
    private readonly pipelineType: AvailablePipelines,
  ) {}

  // TODO: FIX THE ROOT CAUSE INSTEAD OF HAVING THIS

  /**
   * Redis cannot safely round-trip Mongoose documents: ObjectId fields become
   * plain objects with Buffers, which later cause CastErrors when persisted
   * back to MongoDB. We strip Mongo-specific metadata before caching.
   */
  private sanitizeForCache<TValue>(value: TValue): TValue {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;

    // Dates are fine to store as-is; v8 serialization preserves them
    if (value instanceof Date) return value;

    if (Array.isArray(value)) {
      const sanitizedArray = (value as unknown[]).map((item) =>
        this.sanitizeForCache(item),
      );
      return sanitizedArray as unknown as TValue;
    }

    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(record)) {
      if (key === '_id' || key === '__v') {
        continue; // drop mongo metadata
      }
      sanitized[key] = this.sanitizeForCache(val);
    }

    return sanitized as TValue;
  }

  protected async updateContext(pipelineId: string, context: TContext) {
    const sanitizedContext = this.sanitizeForCache(context);
    await this.redisStorageService.set(RedisKeys.PIPELINE_ID(pipelineId), {
      ...sanitizedContext,
    });
  }

  abstract runOnce(context: TContext): Promise<PipelineStepOutcome>;
}
