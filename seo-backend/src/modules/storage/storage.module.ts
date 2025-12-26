import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CACHE } from './library/utils/injection-tokens';
import { ImageStorageService } from './services/image-storage.service';
import { RedisStorageService } from './services/redis-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CACHE,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('STORAGE_REDIS_URL');

        const redisInstance: Redis = new Redis(redisUrl, {
          enableReadyCheck: false,
        });

        return redisInstance;
      },
      inject: [ConfigService],
    },
    ImageStorageService,
    RedisStorageService,
  ],
  exports: [ImageStorageService, RedisStorageService, REDIS_CACHE],
})
export class StorageModule {}
