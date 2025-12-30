import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PipelineHighLevelStatus } from '../modules/posts-generation/library/pipelines/pipeline-status.interface';
import { BasePipelineContext } from '../modules/posts-generation/library/pipelines/pipeline.interface';
import { PipelineOrchestrator } from '../modules/posts-generation/pipelines/pipeline.orchestrator';

/**
 * Script to re-enqueue a specific pipeline by ID
 *
 * This script takes a pipeline ID and re-enqueues it for processing.
 * It can optionally reset the pipeline status before enqueuing.
 *
 * Usage:
 * - Re-enqueue without changing status:
 *   npm run enqueue-pipeline GENERATE_POST_PIPELINE_<id>
 *
 * - Re-enqueue and reset to IN_PROGRESS:
 *   npm run enqueue-pipeline GENERATE_POST_PIPELINE_<id> --resetStatus
 *
 * - Re-enqueue with delay (in milliseconds):
 *   npm run enqueue-pipeline GENERATE_POST_PIPELINE_<id> --delay=5000
 *
 * Arguments:
 *   argv[2] - Pipeline ID (required)
 *   argv[3+] - Optional flags: --resetStatus, --delay=<ms>
 */
async function enqueuePipeline() {
  const logger = new Logger('EnqueuePipeline');

  // Parse command line arguments
  const args = process.argv.slice(2);

  // First argument is the pipeline ID
  const pipelineIdArg = args[0];

  // Parse optional flags from remaining arguments
  const resetStatus = args.includes('--resetStatus');

  const delayArg = args
    .find((arg) => arg.startsWith('--delay='))
    ?.split('=')[1];
  const delayMs = delayArg ? parseInt(delayArg, 10) : undefined;

  // Validate required arguments
  if (!pipelineIdArg) {
    logger.error('❌ Missing required argument: Pipeline ID');
    logger.log('\nUsage:');
    logger.log('  npm run enqueue-pipeline GENERATE_POST_PIPELINE_<id>');
    logger.log('\nOptional arguments:');
    logger.log('  --resetStatus    Reset pipeline status to IN_PROGRESS');
    logger.log('  --delay=<ms>     Delay before processing (in milliseconds)');
    logger.log('\nArgument positions:');
    logger.log('  argv[2] - Pipeline ID (required)');
    logger.log('  argv[3+] - Optional flags');
    process.exit(1);
  }

  logger.log(`Starting pipeline enqueue for: ${pipelineIdArg}`);

  // Bootstrap NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const pipelineOrchestrator = app.get(PipelineOrchestrator);

    // Get current context
    logger.log('Fetching pipeline context...');
    const context =
      await pipelineOrchestrator.getContextForPipeline<BasePipelineContext>(
        pipelineIdArg,
      );

    if (!context) {
      logger.error(`❌ Pipeline ${pipelineIdArg} not found in Redis`);
      await app.close();
      process.exit(1);
    }

    // Display current pipeline info
    logger.log('\n=== Pipeline Information ===');
    logger.log(`Pipeline ID: ${context.pipelineId}`);
    logger.log(`Pipeline Type: ${context.pipelineType}`);
    logger.log(`Current Status: ${context.status}`);
    logger.log(`Current Step: ${context.step}`);
    logger.log(`Started At: ${context.startedAt.toISOString()}`);

    // Reset status if requested
    if (resetStatus) {
      logger.log('\n📝 Resetting pipeline status to IN_PROGRESS...');

      context.status = PipelineHighLevelStatus.IN_PROGRESS;
      await pipelineOrchestrator.updateContextForPipeline(
        pipelineIdArg,
        context,
      );
      logger.log('✅ Status updated to IN_PROGRESS');
    }

    // Enqueue the pipeline
    logger.log('\n🔄 Enqueuing pipeline for processing...');
    if (delayMs) {
      logger.log(`⏱️  With delay: ${delayMs}ms`);
    }

    await pipelineOrchestrator.enqueuePipelineStep(pipelineIdArg, {
      delayMs,
    });

    logger.log('✅ Pipeline successfully enqueued!');
    logger.log('\n=== Summary ===');
    logger.log(`Pipeline ID: ${pipelineIdArg}`);
    logger.log(
      `Status: ${resetStatus ? 'IN_PROGRESS (reset)' : context.status}`,
    );
    logger.log(`Delay: ${delayMs ? `${delayMs}ms` : 'None'}`);
  } catch (error) {
    logger.error('❌ Fatal error in enqueue script:', error);
    throw error;
  } finally {
    // Close the application
    await app.close();
    logger.log('\nScript completed. Application closed.');
  }
}

// Run the script
enqueuePipeline()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
