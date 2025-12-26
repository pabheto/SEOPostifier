export enum BasePipelineStep {
  INIT = 'INIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface BasePipelineContext<S = BasePipelineStep> {
  startedAt: Date;
  step: S;
}

export abstract class Pipeline {
  protected async updateContext() {}
}
