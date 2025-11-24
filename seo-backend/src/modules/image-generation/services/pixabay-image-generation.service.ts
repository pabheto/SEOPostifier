import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ImageStorageService,
  ImageUploadResult,
} from '../../storage/services/image-storage.service';

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
}

export interface GeneratedImageResult extends ImageUploadResult {
  model: string;
}

interface PixabayImageHit {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface PixabayApiResponse {
  total: number;
  totalHits: number;
  hits: PixabayImageHit[];
}

@Injectable()
export class PixabayImageGenerationService {
  private readonly logger = new Logger(PixabayImageGenerationService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://pixabay.com/api/';
  private readonly defaultModel = 'pixabay';

  constructor(
    private readonly configService: ConfigService,
    private readonly imageStorageService: ImageStorageService,
  ) {
    this.apiKey =
      this.configService.get<string>('PIXABAY_API_KEY') ||
      '53392497-7d329258d7deb15a72385614f'; // Default key from user's example

    if (!this.apiKey) {
      this.logger.warn(
        'PIXABAY_API_KEY not found in environment variables. Pixabay image generation will fail until configured.',
      );
    }
  }

  /**
   * Generates an image from a text prompt using Pixabay API
   */
  async generateImage(
    options: GenerateImageOptions,
  ): Promise<GeneratedImageResult> {
    const { prompt, model = this.defaultModel } = options;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }

    this.logger.debug(
      `Generating image with Pixabay (${model}), prompt: ${prompt}`,
    );

    try {
      // Search for images on Pixabay
      const searchUrl = `${this.apiUrl}?key=${this.apiKey}&q=${encodeURIComponent(prompt)}&image_type=photo&safesearch=true&per_page=3`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(
          `Pixabay API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as PixabayApiResponse;

      if (!data.hits || data.hits.length === 0) {
        throw new InternalServerErrorException(
          `No images found for prompt: ${prompt}`,
        );
      }

      // Use the first result (best match)
      const imageHit = data.hits[0];
      const imageUrl = imageHit.largeImageURL || imageHit.webformatURL;

      this.logger.debug(
        `Found ${data.totalHits} images, using: ${imageHit.pageURL}`,
      );

      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`,
        );
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Determine MIME type from response or default to jpeg
      const contentType =
        imageResponse.headers.get('content-type') || 'image/jpeg';

      // Extract file extension from URL or use jpg as default
      const urlPath = new URL(imageUrl).pathname;
      const extension =
        urlPath.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '.jpg';
      const originalName = `pixabay-generated_${Date.now()}${extension}`;

      // Save the downloaded image using the storage service
      const uploadResult = await this.imageStorageService.storeImage({
        fieldname: 'generated',
        originalname: originalName,
        encoding: 'binary',
        mimetype: contentType,
        size: imageBuffer.length,
        buffer: imageBuffer,
      });

      this.logger.log(
        `Pixabay image downloaded and saved: ${uploadResult.filename}`,
      );

      return {
        ...uploadResult,
        model,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate image with Pixabay: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        `Failed to generate image with Pixabay: ${errorMessage}`,
      );
    }
  }
}
