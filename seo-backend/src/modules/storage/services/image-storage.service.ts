import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface ImageUploadResult {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
}

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly baseUrl: string;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(private readonly configService: ConfigService) {
    // Get S3 configuration from environment variables
    const endpoint =
      this.configService.get<string>('S3_ENDPOINT') ||
      'https://ams3.digitaloceanspaces.com';
    const region = this.configService.get<string>('S3_REGION') || 'ams3';
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
    );
    this.bucketName =
      this.configService.get<string>('S3_BUCKET_NAME') || 'seo-postifier';

    // Base URL for public access (defaults to the provided endpoint)
    this.baseUrl =
      this.configService.get<string>('S3_BASE_URL') ||
      `https://${this.bucketName}.${region}.digitaloceanspaces.com`;

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY not found. S3 operations will fail until configured.',
      );
    }

    // Initialize S3 client for DigitalOcean Spaces
    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
      forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted-style
    });

    this.logger.log(`S3 client initialized for bucket: ${this.bucketName}`);
  }

  /**
   * Validates the uploaded file
   */
  private validateFile(file: UploadedFile | undefined): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const mimetype = file.mimetype;
    if (!mimetype || !this.allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(
        `File type ${mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    const size = file.size;
    if (size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${size} exceeds maximum allowed size of ${this.maxFileSize} bytes`,
      );
    }
  }

  /**
   * Generates a unique filename
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();
    const uuid = randomUUID().substring(0, 8);
    return `${sanitizedBaseName}_${timestamp}_${uuid}${ext}`;
  }

  /**
   * Stores an uploaded image file
   */
  async storeImage(file: UploadedFile | undefined): Promise<ImageUploadResult> {
    this.validateFile(file);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const originalName = file.originalname;
    const filename = this.generateFilename(originalName);
    const key = `images/${filename}`; // Store in images/ prefix

    try {
      const buffer = file.buffer;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the file publicly accessible
      });

      await this.s3Client.send(command);
      this.logger.log(`Image stored in S3: ${key}`);

      // Generate public URL
      const url = `${this.baseUrl}/${key}`;

      return {
        filename,
        originalName,
        path: key, // Store S3 key instead of file path
        size: file.size,
        mimeType: file.mimetype,
        url,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to store image: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to store image');
    }
  }

  /**
   * Stores multiple images
   */
  async storeImages(files: UploadedFile[]): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.storeImage(file);
        results.push(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Failed to store image ${file.originalname}: ${errorMessage}`,
        );
        // Continue with other files even if one fails
      }
    }

    return results;
  }

  /**
   * Retrieves an image file
   */
  async getImage(filename: string): Promise<Buffer> {
    // Security: prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const key = `images/${sanitizedFilename}`;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new BadRequestException(`Image not found: ${filename}`);
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      if (response.Body && typeof response.Body === 'object') {
        // AWS SDK v3 returns Body as a Readable stream
        const stream = response.Body as AsyncIterable<Uint8Array>;
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
      }
      const buffer = Buffer.concat(chunks);

      return buffer;
    } catch (error) {
      if (
        error instanceof Error &&
        'name' in error &&
        error.name === 'NoSuchKey'
      ) {
        throw new BadRequestException(`Image not found: ${filename}`);
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to retrieve image: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to retrieve image');
    }
  }

  /**
   * Checks if an image exists
   */
  async imageExists(filename: string): Promise<boolean> {
    // Security: prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const key = `images/${sanitizedFilename}`;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        'name' in error &&
        error.name === 'NotFound'
      ) {
        return false;
      }
      // For other errors, log and return false
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error checking image existence: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Deletes an image file
   */
  async deleteImage(filename: string): Promise<void> {
    // Security: prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const key = `images/${sanitizedFilename}`;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Image deleted from S3: ${key}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete image: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to delete image');
    }
  }

  /**
   * Gets the URL for an image
   */
  getImageUrl(filename: string): string {
    const sanitizedFilename = path.basename(filename);
    const key = `images/${sanitizedFilename}`;
    return `${this.baseUrl}/${key}`;
  }
}
