import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { GeneratePostContentJobData } from '../interfaces/post-generation-job.interface';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.POST_GENERATION)
    private readonly postGenerationQueue: Queue,
  ) {}

  /**
   * Add a job to generate post content (introduction, section, image, or FAQ)
   */
  async addGeneratePostContentJob(data: GeneratePostContentJobData) {
    // Generate job ID based on content type
    const jobId = this.generateJobId(data);

    // Set priority based on content type
    const priority = this.getPriorityForContentType(data.contentType);

    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_POST_CONTENT, data, {
      priority,
      jobId,
    });
  }

  /**
   * Generate a unique job ID based on content type and data
   */
  private generateJobId(data: GeneratePostContentJobData): string {
    const { contentType, postId } = data;
    if (contentType === 'introduction') {
      return `intro-${postId}`;
    }
    if (contentType === 'section') {
      return `section-${postId}-${data.section.title}`;
    }
    if (contentType === 'image') {
      return `image-${postId}-${data.sectionTitle}-${Date.now()}`;
    }
    if (contentType === 'faq') {
      return `faq-${postId}`;
    }
    // This should never happen due to TypeScript exhaustiveness checking
    throw new Error(`Unknown content type: ${contentType}`);
  }

  /**
   * Get priority for different content types
   * Lower number = higher priority
   */
  private getPriorityForContentType(
    contentType: GeneratePostContentJobData['contentType'],
  ): number {
    switch (contentType) {
      case 'introduction':
        return 1; // Highest priority - needed first
      case 'section':
        return 2; // High priority - main content
      case 'faq':
        return 2; // High priority - but can be generated in parallel
      case 'image':
        return 3; // Lower priority - can be generated in parallel with sections
      default:
        return 5;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    const job = await this.postGenerationQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress as number;
    const returnValue = job.returnvalue as unknown;
    const failedReason = job.failedReason as string | undefined;

    return {
      id: job.id,
      name: job.name,
      state,
      progress,
      returnValue,
      failedReason,
      data: job.data as GeneratePostContentJobData,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.postGenerationQueue.getWaitingCount(),
      this.postGenerationQueue.getActiveCount(),
      this.postGenerationQueue.getCompletedCount(),
      this.postGenerationQueue.getFailedCount(),
      this.postGenerationQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }
}
