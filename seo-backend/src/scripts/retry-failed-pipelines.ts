import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PipelineHighLevelStatus } from '../modules/posts-generation/library/pipelines/pipeline-status.interface';
import { BasePipelineContext } from '../modules/posts-generation/library/pipelines/pipeline.interface';
import { PipelineOrchestrator } from '../modules/posts-generation/pipelines/pipeline.orchestrator';
import { RedisStorageService } from '../modules/storage';

/**
 * Script to retry failed pipelines
 *
 * This script scans all pipelines in Redis, finds the ones marked as FAILED,
 * marks them as IN_PROGRESS, and enqueues them again for processing.
 *
 * Usage:
 * - To retry all failed pipelines: npm run retry-failed-pipelines
 * - To retry a specific pipeline: npm run retry-failed-pipelines -- --pipelineId=GENERATE_POST_PIPELINE_<id>
 */
async function retryFailedPipelines() {
  const logger = new Logger('RetryFailedPipelines');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const specificPipelineId = args
    .find((arg) => arg.startsWith('--pipelineId='))
    ?.split('=')[1];

  logger.log('Starting retry failed pipelines script...');

  // Bootstrap NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const redisStorageService = app.get(RedisStorageService);
    const pipelineOrchestrator = app.get(PipelineOrchestrator);

    let pipelineIdsToRetry: string[] = [];

    if (specificPipelineId) {
      // Retry specific pipeline
      logger.log(`Retrying specific pipeline: ${specificPipelineId}`);
      pipelineIdsToRetry = [specificPipelineId];
    } else {
      // Find all pipeline keys
      logger.log('Scanning for all pipeline keys...');
      const allPipelineKeys = await redisStorageService.keys('pipeline:*');
      logger.log(`Found ${allPipelineKeys.length} total pipeline(s) in Redis`);

      // Extract pipeline IDs from keys (remove 'pipeline:' prefix)
      const allPipelineIds = allPipelineKeys.map((key) =>
        key.replace('pipeline:', ''),
      );

      // Filter for failed pipelines
      logger.log('Checking pipeline statuses...');
      const failedPipelineIds: string[] = [];

      for (const pipelineId of allPipelineIds) {
        try {
          const context =
            await pipelineOrchestrator.getContextForPipeline<BasePipelineContext>(
              pipelineId,
            );

          if (context && context.status === PipelineHighLevelStatus.FAILED) {
            failedPipelineIds.push(pipelineId);
            logger.log(
              `Found failed pipeline: ${pipelineId} (step: ${context.step})`,
            );
          }
        } catch (error) {
          logger.error(`Error reading pipeline ${pipelineId}:`, error);
        }
      }

      pipelineIdsToRetry = failedPipelineIds;
      logger.log(
        `Found ${failedPipelineIds.length} failed pipeline(s) to retry`,
      );
    }

    if (pipelineIdsToRetry.length === 0) {
      logger.log('No failed pipelines to retry. Exiting.');
      await app.close();
      return;
    }

    // Retry each failed pipeline
    let successCount = 0;
    let errorCount = 0;

    for (const pipelineId of pipelineIdsToRetry) {
      try {
        logger.log(`Processing pipeline: ${pipelineId}`);

        // Get current context
        const context =
          await pipelineOrchestrator.getContextForPipeline<BasePipelineContext>(
            pipelineId,
          );

        if (!context) {
          logger.warn(`Pipeline ${pipelineId} not found, skipping...`);
          errorCount++;
          continue;
        }

        // Verify it's actually failed before retrying
        if (context.status !== PipelineHighLevelStatus.FAILED) {
          logger.warn(
            `Pipeline ${pipelineId} is not in FAILED status (current: ${context.status}), skipping...`,
          );
          errorCount++;
          continue;
        }

        // Update status to IN_PROGRESS
        context.status = PipelineHighLevelStatus.IN_PROGRESS;
        await pipelineOrchestrator.updateContextForPipeline(
          pipelineId,
          context,
        );

        // Enqueue the pipeline step
        await pipelineOrchestrator.enqueuePipelineStep(pipelineId);

        logger.log(`✅ Successfully enqueued pipeline ${pipelineId} for retry`);
        successCount++;
      } catch (error) {
        logger.error(`❌ Error processing pipeline ${pipelineId}:`, error);
        errorCount++;
      }
    }

    logger.log('\n=== Summary ===');
    logger.log(`Total pipelines processed: ${pipelineIdsToRetry.length}`);
    logger.log(`Successfully enqueued: ${successCount}`);
    logger.log(`Errors: ${errorCount}`);
  } catch (error) {
    logger.error('Fatal error in retry script:', error);
    throw error;
  } finally {
    // Close the application
    await app.close();
    logger.log('Script completed. Application closed.');
  }
}

// Run the script
retryFailedPipelines()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
