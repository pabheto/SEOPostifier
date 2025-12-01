import { GoogleGenAI } from '@google/genai';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import {
  ImageStorageService,
  ImageUploadResult,
} from '../../storage/services/image-storage.service';

export type AspectRatio = '16:9' | '4:3' | '3:2' | '1:1' | '9:16';

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  aspectRatio?: AspectRatio;
}

export interface EditImageOptions {
  prompt: string;
  imageBuffer: Buffer;
  imageMimeType?: string;
  model?: string;
  aspectRatio?: AspectRatio;
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
   * Converts aspect ratio string to width and height dimensions
   */
  private getAspectRatioDimensions(
    aspectRatio: AspectRatio,
    baseSize: number = 1024,
  ): { width: number; height: number } {
    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const ratio = widthRatio / heightRatio;

    if (ratio > 1) {
      // Landscape: width > height
      return {
        width: baseSize,
        height: Math.round(baseSize / ratio),
      };
    } else if (ratio < 1) {
      // Portrait: height > width
      return {
        width: Math.round(baseSize * ratio),
        height: baseSize,
      };
    } else {
      // Square
      return {
        width: baseSize,
        height: baseSize,
      };
    }
  }

  /**
   * Processes an image buffer to match the desired aspect ratio by cropping
   */
  private async processImageToAspectRatio(
    imageBuffer: Buffer,
    aspectRatio: AspectRatio,
  ): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const currentWidth = metadata.width || 1024;
      const currentHeight = metadata.height || 1024;
      const currentAspectRatio = currentWidth / currentHeight;

      const [targetWidthRatio, targetHeightRatio] = aspectRatio
        .split(':')
        .map(Number);
      const targetAspectRatio = targetWidthRatio / targetHeightRatio;

      // If aspect ratios match (within 1% tolerance), return original
      if (Math.abs(currentAspectRatio - targetAspectRatio) < 0.01) {
        this.logger.debug(
          `Image already matches aspect ratio ${aspectRatio}, skipping processing`,
        );
        return imageBuffer;
      }

      let newWidth: number;
      let newHeight: number;
      let left = 0;
      let top = 0;

      if (currentAspectRatio > targetAspectRatio) {
        // Current image is wider than target - crop width
        newHeight = currentHeight;
        newWidth = Math.round(currentHeight * targetAspectRatio);
        left = Math.round((currentWidth - newWidth) / 2);
        top = 0;
      } else {
        // Current image is taller than target - crop height
        newWidth = currentWidth;
        newHeight = Math.round(currentWidth / targetAspectRatio);
        left = 0;
        top = Math.round((currentHeight - newHeight) / 2);
      }

      this.logger.debug(
        `Cropping image from ${currentWidth}x${currentHeight} to ${newWidth}x${newHeight} (aspect ratio: ${aspectRatio})`,
      );

      const processedBuffer = await image
        .extract({
          left,
          top,
          width: newWidth,
          height: newHeight,
        })
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process image to aspect ratio: ${errorMessage}`,
      );
      // Return original buffer if processing fails
      return imageBuffer;
    }
  }

  /**
   * Enhances a prompt to generate realistic, stock photo-like images
   */
  private enhancePromptForRealisticImage(
    originalPrompt: string,
    aspectRatio?: AspectRatio,
  ): string {
    const enhancementInstructions = [
      'professional stock photography',
      'high-quality realistic photograph',
      'natural lighting and authentic colors',
      'sharp focus and crisp details',
      'no AI artifacts or digital rendering look',
      'photorealistic style',
      'editorial photography quality',
      'natural shadows and depth',
      'real-world texture and imperfections',
      'candid and authentic appearance',
      'shot with professional camera',
      '8K resolution quality',
      'no oversaturation or artificial enhancement',
      'lifelike and believable',
    ].join(', ');

    let aspectRatioInstruction = '';
    if (aspectRatio) {
      const aspectRatioDescriptions: Record<AspectRatio, string> = {
        '16:9':
          'widescreen landscape format (16:9 aspect ratio, rectangular horizontal)',
        '4:3':
          'standard landscape format (4:3 aspect ratio, rectangular horizontal)',
        '3:2':
          'photography standard format (3:2 aspect ratio, rectangular horizontal)',
        '1:1': 'square format (1:1 aspect ratio)',
        '9:16': 'portrait format (9:16 aspect ratio, rectangular vertical)',
      };
      aspectRatioInstruction = ` The image must be in ${aspectRatioDescriptions[aspectRatio]}.`;
    }

    return `${originalPrompt}. Style: ${enhancementInstructions}.${aspectRatioInstruction} The image should look like a professional stock photo taken with a high-end camera, completely natural and realistic with no signs of AI generation.`;
  }

  /**
   * Generates an image from a text prompt using Nano Banana (Gemini 2.5 Flash Image)
   */
  async generateImage(
    options: GenerateImageOptions,
  ): Promise<GeneratedImageResult> {
    const { prompt, model = this.defaultModel, aspectRatio = '16:9' } = options;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }

    // Enhance the prompt for realistic, stock photo-like images with aspect ratio
    const enhancedPrompt = this.enhancePromptForRealisticImage(
      prompt,
      aspectRatio,
    );

    this.logger.debug(
      `Generating image with Nano Banana (${model}), original prompt: ${prompt}`,
    );
    this.logger.debug(`Enhanced prompt: ${enhancedPrompt}`);

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: enhancedPrompt,
      });

      // Extract image from response
      let imageBuffer = this.extractImageFromResponse(response);

      if (!imageBuffer) {
        throw new InternalServerErrorException(
          'No image data found in Nano Banana response',
        );
      }

      // Process image to match the desired aspect ratio
      if (aspectRatio) {
        this.logger.debug(
          `Processing generated image to aspect ratio: ${aspectRatio}`,
        );
        imageBuffer = await this.processImageToAspectRatio(
          imageBuffer,
          aspectRatio,
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
      aspectRatio,
    } = options;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Image buffer is required');
    }

    // Enhance the prompt for realistic, stock photo-like images with aspect ratio
    const enhancedPrompt = this.enhancePromptForRealisticImage(
      prompt,
      aspectRatio,
    );

    this.logger.debug(
      `Editing image with Nano Banana (${model}), original prompt: ${prompt}`,
    );
    this.logger.debug(`Enhanced prompt: ${enhancedPrompt}`);

    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Prepare the prompt with image data
      const contents = [
        { text: enhancedPrompt },
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
      let editedImageBuffer = this.extractImageFromResponse(response);

      if (!editedImageBuffer) {
        throw new InternalServerErrorException(
          'No image data found in Nano Banana response',
        );
      }

      // Process image to match the desired aspect ratio
      if (aspectRatio) {
        this.logger.debug(
          `Processing edited image to aspect ratio: ${aspectRatio}`,
        );
        editedImageBuffer = await this.processImageToAspectRatio(
          editedImageBuffer,
          aspectRatio,
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
