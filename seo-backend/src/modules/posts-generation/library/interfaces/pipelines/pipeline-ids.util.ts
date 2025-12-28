import { AvailablePipelines } from './pipeline.interface';

const POST_GENERATION_PREFIX = 'postGeneration';

export function buildPipelineId(
  pipelineType: AvailablePipelines,
  pipelineId: string,
) {
  return `${pipelineType}_${pipelineId}`;
}

export const getPipelineFromId = (pipelineId: string) => {
  if (pipelineId.startsWith(POST_GENERATION_PREFIX)) {
    return AvailablePipelines.GENERATE_POST_PIPELINE;
  }

  throw new Error(`Unknown pipeline type: ${pipelineId}`);
};
