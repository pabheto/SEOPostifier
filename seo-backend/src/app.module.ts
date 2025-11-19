import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmManagerModule } from './modules/llm-manager';
import { PostInterviewsModule } from './modules/post-interviews/post-interviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27028/seo_postifier',
      {
        retryAttempts: 3,
        retryDelay: 1000,
      },
    ),

    LlmManagerModule,
    PostInterviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
