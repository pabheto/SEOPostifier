import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmManagerModule } from '../llm-manager/llm-manager.module';
import { PostsManagementController } from './controllers/post-interviews.controller';
import {
  PostInterview,
  PostInterviewSchema,
} from './schemas/post-interview.schema';
import { Post, PostSchema } from './schemas/posts.schema';
import { PostInterviewsService } from './services/posts-interviews.service';
import { PostsManagementService } from './services/posts-management.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PostInterview.name,
        schema: PostInterviewSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    LlmManagerModule, // Import LlmManagerModule to use GroqService
  ],
  controllers: [PostsManagementController],
  providers: [PostInterviewsService, PostsManagementService],
  exports: [PostInterviewsService, PostsManagementService],
})
export class PostsManagementModule {}
