import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

interface CompressedImage {
  id: string;
  thumbnailBuffer: Buffer;
  fullBuffer: Buffer;
  filename: string;
  sizeBytes: number;
}

@Injectable()
export class ImageUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly minWidth = 400;
  private readonly minHeight = 300;
  private readonly allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly thumbnailWidth = 300;
  private readonly fullWidth = 1200;

  async validateAndCompressImage(
    file: Express.Multer.File,
  ): Promise<CompressedImage> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`,
      );
    }

    if (!this.allowedFormats.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image format. Allowed: ${this.allowedFormats.join(', ')}`,
      );
    }

    const metadata = await sharp(file.buffer).metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < this.minWidth ||
      metadata.height < this.minHeight
    ) {
      throw new BadRequestException(
        `Image dimensions must be at least ${this.minWidth}x${this.minHeight}px`,
      );
    }

    const imageId = uuidv4();
    const filename = `${imageId}-${Date.now()}`;

    const thumbnailBuffer = await sharp(file.buffer)
      .resize(this.thumbnailWidth, this.thumbnailWidth, {
        fit: 'cover',
        position: 'center',
      })
      .toBuffer();

    const fullBuffer = await sharp(file.buffer)
      .resize(this.fullWidth, undefined, { withoutEnlargement: true })
      .toBuffer();

    return {
      id: imageId,
      thumbnailBuffer,
      fullBuffer,
      filename,
      sizeBytes: fullBuffer.length,
    };
  }

  async validateMultipleImages(files: Express.Multer.File[]): Promise<void> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images per upload');
    }

    for (const file of files) {
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds size limit`,
        );
      }

      if (!this.allowedFormats.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid format`,
        );
      }
    }
  }

  async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      throw new BadRequestException('Failed to create upload directory');
    }
  }

  getImageUrl(filename: string, type: 'thumbnail' | 'full'): string {
    const baseUrl = process.env.IMAGE_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/uploads/${filename}-${type}.webp`;
  }
}
