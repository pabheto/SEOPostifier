import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ImageGenerationModule } from './modules/image-generation/image-generation.module';
import { LlmManagerModule } from './modules/llm-manager';
import { PostsManagementModule } from './modules/posts-management/posts-management.module';
import { StorageModule } from './modules/storage';
import { AdministrationModule } from './modules/administration/administration.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';

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

    ImageGenerationModule,
    LlmManagerModule,
    PostsManagementModule,
    StorageModule,
    UsersModule,
    SubscriptionsModule,
    AdministrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
