import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { GeneratePostContentJobData } from '../interfaces/post-generation-job.interface';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

@Injectable()
export class PostGenerationService {
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

    return this.postGenerationQueue.add(JOB_NAMES.GENERATE_POST_CONTENT, data, {
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
    throw new Error(`Unknown content type: ${contentType as string}`);
  }
}
