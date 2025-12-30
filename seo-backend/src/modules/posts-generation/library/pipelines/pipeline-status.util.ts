import { PipelineHighLevelStatus } from './pipeline-status.interface';

export const isPipelineInTerminalState = (status: PipelineHighLevelStatus) => {
  return (
    status === PipelineHighLevelStatus.COMPLETED ||
    status === PipelineHighLevelStatus.CANCELLED ||
    status === PipelineHighLevelStatus.FAILED
  );
};
