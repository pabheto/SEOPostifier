import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
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
  private readonly uploadPath: string;
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
    // Get upload path from config or use default
    this.uploadPath =
      this.configService.get<string>('STORAGE_UPLOAD_PATH') ||
      path.join(process.cwd(), 'uploads', 'images');

    // Ensure upload directory exists
    void this.ensureUploadDirectoryExists();
  }

  /**
   * Ensures the upload directory exists, creates it if it doesn't
   */
  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      try {
        await fs.mkdir(this.uploadPath, { recursive: true });
        this.logger.log(`Created upload directory: ${this.uploadPath}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to create upload directory: ${errorMessage}`);
        throw new InternalServerErrorException(
          'Failed to initialize storage directory',
        );
      }
    }
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
    const filePath = path.join(this.uploadPath, filename);

    try {
      const buffer = file.buffer;
      await fs.writeFile(filePath, buffer);
      this.logger.log(`Image stored: ${filename}`);

      // Generate URL (you can customize this based on your needs)
      const baseUrl =
        this.configService.get<string>('STORAGE_BASE_URL') || '/uploads/images';
      const url = `${baseUrl}/${filename}`;

      return {
        filename,
        originalName,
        path: filePath,
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
    const filePath = path.join(this.uploadPath, filename);

    try {
      // Security: prevent directory traversal
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadPath = path.resolve(this.uploadPath);

      if (!resolvedPath.startsWith(resolvedUploadPath)) {
        throw new BadRequestException('Invalid file path');
      }

      return await fs.readFile(filePath);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
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
    const filePath = path.join(this.uploadPath, filename);

    try {
      // Security: prevent directory traversal
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadPath = path.resolve(this.uploadPath);

      if (!resolvedPath.startsWith(resolvedUploadPath)) {
        return false;
      }

      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes an image file
   */
  async deleteImage(filename: string): Promise<void> {
    const filePath = path.join(this.uploadPath, filename);

    try {
      // Security: prevent directory traversal
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadPath = path.resolve(this.uploadPath);

      if (!resolvedPath.startsWith(resolvedUploadPath)) {
        throw new BadRequestException('Invalid file path');
      }

      await fs.unlink(filePath);
      this.logger.log(`Image deleted: ${filename}`);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new BadRequestException(`Image not found: ${filename}`);
      }
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
    const baseUrl =
      this.configService.get<string>('STORAGE_BASE_URL') || '/uploads/images';
    return `${baseUrl}/${filename}`;
  }
}
