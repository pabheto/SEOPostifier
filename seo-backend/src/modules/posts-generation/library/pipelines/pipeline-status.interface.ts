export enum PipelineHighLevelStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export type PipelineVerbosedStatus = {
  status: PipelineHighLevelStatus;
  progress?: number;
  statusLabel?: string;
};
