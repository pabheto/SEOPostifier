import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmManagerModule } from 'src/modules/llm-manager/llm-manager.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './library/logging/logger.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AdministrationModule } from './modules/administration/administration.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { QueueBoardModule } from './modules/bull-board/bull-board.module';
import { ImageGenerationModule } from './modules/image-generation/image-generation.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { PostsGenerationModule } from './modules/posts-generation/posts-generation.module';
import { PostsManagementModule } from './modules/posts-management/posts-management.module';
import { StorageModule } from './modules/storage';
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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('STORAGE_REDIS_URL');
        return {
          connection: {
            url: redisUrl,
            enableReadyCheck: false,
          },
        };
      },
    }),

    // Logger module (must be imported before other modules to ensure logging is available)
    LoggerModule,

    ImageGenerationModule,
    LlmManagerModule,
    PostsManagementModule,
    StorageModule,
    UsersModule,
    LicensesModule,
    SubscriptionsModule,
    AdministrationModule,
    PostsGenerationModule,
    AnalyticsModule,
    QueueBoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
