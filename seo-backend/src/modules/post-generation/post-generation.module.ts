import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostGenerationProcessor } from './processors/post-generation.processor';
import { QUEUE_NAMES } from './queue.constants';
import { PostGenerationService } from './services/post-generation.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000, // Keep max 1000 completed jobs
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
          },
        },
      }),
      inject: [ConfigService],
    }),
    // Register the post generation queue
    BullModule.registerQueue({
      name: QUEUE_NAMES.POST_GENERATION,
    }),
  ],
  providers: [PostGenerationService, PostGenerationProcessor],
  exports: [BullModule, PostGenerationService],
})
export class PostGenerationModule {}
