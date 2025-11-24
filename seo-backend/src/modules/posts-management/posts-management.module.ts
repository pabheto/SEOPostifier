import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageGenerationModule } from '../image-generation/image-generation.module';
import { LlmManagerModule } from '../llm-manager/llm-manager.module';
import { UsersModule } from '../users/users.module';
import { PostsInterviewsController } from './controllers/post-interviews.controller';
import { PostsManagementController } from './controllers/posts-management.controller';
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
    UsersModule, // Import UsersModule for license-based authentication
    ImageGenerationModule, // Import ImageGenerationModule to use NanoBananaImageGenerationService
  ],
  controllers: [PostsManagementController, PostsInterviewsController],
  providers: [PostInterviewsService, PostsManagementService],
  exports: [PostInterviewsService, PostsManagementService],
})
export class PostsManagementModule {}
