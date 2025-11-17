import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './modules/posts/posts.module';
import { LlmManagerModule } from './modules/llm-manager';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27028/seo_postifier',
      {
        retryAttempts: 3,
        retryDelay: 1000,
      },
    ),
    PostsModule,
    LlmManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
