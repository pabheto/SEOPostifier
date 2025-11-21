import { GoogleGenAI } from '@google/genai';
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

export interface EditImageOptions {
  prompt: string;
  imageBuffer: Buffer;
  imageMimeType?: string;
  model?: string;
}

export interface GeneratedImageResult extends ImageUploadResult {
  model: string;
}

@Injectable()
export class NanoBananaImageGenerationService {
  private readonly logger = new Logger(NanoBananaImageGenerationService.name);
  private readonly ai: GoogleGenAI;
  private readonly defaultModel = 'gemini-2.5-flash-image';

  constructor(
    private readonly configService: ConfigService,
    private readonly imageStorageService: ImageStorageService,
  ) {
    // Support both GOOGLE_API_KEY and GOOGLE_GENAI_API_KEY
    const apiKey =
      this.configService.get<string>('GOOGLE_API_KEY') ||
      this.configService.get<string>('GOOGLE_GENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY or GOOGLE_GENAI_API_KEY not found in environment variables. Nano Banana image generation will fail until configured.',
      );
    }

    // GoogleGenAI can read from GOOGLE_API_KEY env var automatically
    // but we'll pass it explicitly if provided
    this.ai = new GoogleGenAI(apiKey ? { apiKey } : {});
  }

  /**
   * Generates an image from a text prompt using Nano Banana (Gemini 2.5 Flash Image)
   */
  async generateImage(
    options: GenerateImageOptions,
  ): Promise<GeneratedImageResult> {
    const { prompt, model = this.defaultModel } = options;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }

    this.logger.debug(
      `Generating image with Nano Banana (${model}), prompt: ${prompt}`,
    );

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
      });

      // Extract image from response
      const imageBuffer = this.extractImageFromResponse(response);

      if (!imageBuffer) {
        throw new InternalServerErrorException(
          'No image data found in Nano Banana response',
        );
      }

      // Save the generated image using the storage service
      const uploadResult = await this.imageStorageService.storeImage({
        fieldname: 'generated',
        originalname: `nano-banana-generated_${Date.now()}.png`,
        encoding: 'base64',
        mimetype: 'image/png',
        size: imageBuffer.length,
        buffer: imageBuffer,
      });

      this.logger.log(
        `Nano Banana image generated and saved: ${uploadResult.filename}`,
      );

      return {
        ...uploadResult,
        model,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate image with Nano Banana: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        `Failed to generate image with Nano Banana: ${errorMessage}`,
      );
    }
  }

  /**
   * Edits an image based on a prompt and an existing image using Nano Banana
   */
  async editImage(options: EditImageOptions): Promise<GeneratedImageResult> {
    const {
      prompt,
      imageBuffer,
      imageMimeType = 'image/png',
      model = this.defaultModel,
    } = options;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Image buffer is required');
    }

    this.logger.debug(
      `Editing image with Nano Banana (${model}), prompt: ${prompt}`,
    );

    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Prepare the prompt with image data
      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: imageMimeType,
            data: base64Image,
          },
        },
      ];

      const response = await this.ai.models.generateContent({
        model,
        contents,
      });

      // Extract image from response
      const editedImageBuffer = this.extractImageFromResponse(response);

      if (!editedImageBuffer) {
        throw new InternalServerErrorException(
          'No image data found in Nano Banana response',
        );
      }

      // Save the edited image using the storage service
      const uploadResult = await this.imageStorageService.storeImage({
        fieldname: 'edited',
        originalname: `nano-banana-edited_${Date.now()}.png`,
        encoding: 'base64',
        mimetype: 'image/png',
        size: editedImageBuffer.length,
        buffer: editedImageBuffer,
      });

      this.logger.log(
        `Nano Banana image edited and saved: ${uploadResult.filename}`,
      );

      return {
        ...uploadResult,
        model,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to edit image with Nano Banana: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        `Failed to edit image with Nano Banana: ${errorMessage}`,
      );
    }
  }

  /**
   * Extracts image buffer from Nano Banana (Gemini) API response
   */
  private extractImageFromResponse(response: any): Buffer | null {
    try {
      if (
        !response.candidates ||
        !response.candidates[0] ||
        !response.candidates[0].content ||
        !response.candidates[0].content.parts
      ) {
        return null;
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          this.logger.debug(`Nano Banana response text: ${part.text}`);
        } else if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          return Buffer.from(imageData, 'base64');
        }
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to extract image from Nano Banana response: ${errorMessage}`,
      );
      return null;
    }
  }
}
