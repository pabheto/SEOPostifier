import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostInterviewsController } from './post-interviews.controller';
import { PostInterviewsService } from './post-interviews.service';
import {
  PostInterview,
  PostInterviewSchema,
} from './schemas/post-interview.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PostInterview.name,
        schema: PostInterviewSchema,
      },
    ]),
  ],
  controllers: [PostInterviewsController],
  providers: [PostInterviewsService],
  exports: [PostInterviewsService],
})
export class PostInterviewsModule {}
