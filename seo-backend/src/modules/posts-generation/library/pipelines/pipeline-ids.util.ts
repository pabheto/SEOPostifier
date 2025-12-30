import { AvailablePipelines } from './pipeline.interface';

export function buildPipelineId(
  pipelineType: AvailablePipelines,
  pipelineId: string,
) {
  return `${pipelineType}_${pipelineId}`;
}

export const getPipelineFromId = (pipelineId: string) => {
  if (pipelineId.startsWith(AvailablePipelines.GENERATE_POST_PIPELINE)) {
    return AvailablePipelines.GENERATE_POST_PIPELINE;
  }

  throw new Error(`Unknown pipeline type: ${pipelineId}`);
};
