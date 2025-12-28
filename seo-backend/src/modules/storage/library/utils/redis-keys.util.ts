export class RedisKeys {
  static readonly PIPELINE_ID = (pipelineId: string) =>
    `pipeline:${pipelineId}`;
}
