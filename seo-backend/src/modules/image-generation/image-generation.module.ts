import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '../storage/storage.module';
import { NanoBananaImageGenerationService } from './services/nano-banana-image-generation.service';
import { PixabayImageGenerationService } from './services/pixabay-image-generation.service';

@Module({
  imports: [ConfigModule, StorageModule],
  providers: [
    NanoBananaImageGenerationService,
    PixabayImageGenerationService,
  ],
  exports: [PixabayImageGenerationService],
})
export class ImageGenerationModule {}
