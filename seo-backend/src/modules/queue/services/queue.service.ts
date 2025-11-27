import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  GenerateFaqJobData,
  GenerateImageJobData,
  GenerateIntroductionJobData,
  GeneratePostJobData,
  GenerateSectionJobData,
} from '../interfaces/post-generation-job.interface';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.POST_GENERATION)
    private readonly postGenerationQueue: Queue,
  ) {}

  /**
   * Add a job to generate a complete post
   */
  async addGeneratePostJob(data: GeneratePostJobData) {
    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_POST, data, {
      priority: 1,
      jobId: `post-${data.postId}`,
    });
  }

  /**
   * Add a job to generate post introduction
   */
  async addGenerateIntroductionJob(data: GenerateIntroductionJobData) {
    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_INTRODUCTION, data, {
      priority: 2,
      jobId: `intro-${data.postId}`,
    });
  }

  /**
   * Add a job to generate a post section
   */
  async addGenerateSectionJob(data: GenerateSectionJobData) {
    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_SECTION, data, {
      priority: 2,
      jobId: `section-${data.postId}-${data.section.title}`,
    });
  }

  /**
   * Add a job to generate an image
   */
  async addGenerateImageJob(data: GenerateImageJobData) {
    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_IMAGE, data, {
      priority: 3,
      jobId: `image-${data.postId}-${Date.now()}`,
    });
  }

  /**
   * Add a job to generate FAQ section
   */
  async addGenerateFaqJob(data: GenerateFaqJobData) {
    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_FAQ, data, {
      priority: 2,
      jobId: `faq-${data.postId}`,
    });
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
    const progress = job.progress;
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      name: job.name,
      state,
      progress,
      returnValue,
      failedReason,
      data: job.data,
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
