# Retry Failed Pipelines Script

This script allows you to retry pipelines that have failed during execution.

## Overview

The script scans Redis for pipelines marked as `FAILED`, updates their status to `IN_PROGRESS`, and re-enqueues them for processing.

## Usage

### Retry All Failed Pipelines

To retry all failed pipelines in the system:

```bash
npm run retry-failed-pipelines
```

or with pnpm:

```bash
pnpm run retry-failed-pipelines
```

### Retry a Specific Pipeline

To retry a specific pipeline by its ID:

```bash
npm run retry-failed-pipelines -- --pipelineId=GENERATE_POST_PIPELINE_<interviewId>
```

Example:

```bash
npm run retry-failed-pipelines -- --pipelineId=GENERATE_POST_PIPELINE_abc123def456
```

## What the Script Does

1. **Scans Redis**: Searches for all pipeline keys matching `pipeline:*`
2. **Filters Failed Pipelines**: Identifies pipelines with `status === PipelineHighLevelStatus.FAILED`
3. **Updates Status**: Changes the status from `FAILED` to `IN_PROGRESS`
4. **Re-enqueues**: Adds the pipeline back to the processing queue using `enqueuePipelineStep`

## Output

The script provides detailed logging:

- Lists all found pipelines
- Shows which pipelines are failed
- Reports success/failure for each retry attempt
- Provides a summary at the end

Example output:

```
[RetryFailedPipelines] Starting retry failed pipelines script...
[RetryFailedPipelines] Scanning for all pipeline keys...
[RetryFailedPipelines] Found 5 total pipeline(s) in Redis
[RetryFailedPipelines] Checking pipeline statuses...
[RetryFailedPipelines] Found failed pipeline: GENERATE_POST_PIPELINE_abc123 (step: CREATE_SCRIPT_DRAFT)
[RetryFailedPipelines] Found failed pipeline: GENERATE_POST_PIPELINE_def456 (step: GENERATE_POST_PARTS)
[RetryFailedPipelines] Found 2 failed pipeline(s) to retry
[RetryFailedPipelines] Processing pipeline: GENERATE_POST_PIPELINE_abc123
[RetryFailedPipelines] ✅ Successfully enqueued pipeline GENERATE_POST_PIPELINE_abc123 for retry
[RetryFailedPipelines] Processing pipeline: GENERATE_POST_PIPELINE_def456
[RetryFailedPipelines] ✅ Successfully enqueued pipeline GENERATE_POST_PIPELINE_def456 for retry

=== Summary ===
Total pipelines processed: 2
Successfully enqueued: 2
Errors: 0
```

## Prerequisites

- The backend application must have access to Redis
- The `.env` file must be properly configured
- The BullMQ queue must be running to process the enqueued pipelines

## When to Use

This script is useful when:

- Pipelines fail due to temporary issues (network errors, rate limits, etc.)
- External API services were temporarily unavailable
- You want to bulk retry multiple failed pipelines
- Manual intervention is needed after fixing a bug

## Safety

The script includes several safety checks:

- Verifies the pipeline exists before retrying
- Confirms the pipeline status is actually `FAILED` before updating
- Handles errors gracefully and continues processing other pipelines
- Provides detailed logging for troubleshooting

## Technical Details

- **Location**: `src/scripts/retry-failed-pipelines.ts`
- **Dependencies**: NestJS application context, RedisStorageService, PipelineOrchestrator
- **Exit Codes**:
  - `0` - Success
  - `1` - Fatal error occurred
