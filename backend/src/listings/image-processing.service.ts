import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as piexifjs from 'piexifjs';
import * as crypto from 'crypto';

interface QualityScore {
  sharpness: number;
  brightness: number;
  contrast: number;
  overall: number;
  warnings: string[];
}

interface Thumbnails {
  thumb: Buffer;
  small: Buffer;
  medium: Buffer;
  large: Buffer;
  full: Buffer;
}

interface ImageMetadata {
  hash: string;
  width: number;
  height: number;
  format: string;
  fileSize: number;
  qualityScore: QualityScore;
}

@Injectable()
export class ImageProcessingService {
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly minWidth = 300;
  private readonly minHeight = 300;

  async processImage(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<{ processed: Buffer; metadata: ImageMetadata; webp: Buffer }> {
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException('File exceeds 10MB limit');
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < this.minWidth ||
      metadata.height < this.minHeight
    ) {
      throw new BadRequestException(
        `Image must be at least ${this.minWidth}x${this.minHeight}px`,
      );
    }

    const hash = this.generateHash(buffer);
    const qualityScore = await this.analyzeQuality(buffer);
    const strippedBuffer = await this.stripExif(buffer);
    const webpBuffer = await this.convertToWebP(strippedBuffer);

    return {
      processed: strippedBuffer,
      metadata: {
        hash,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'jpeg',
        fileSize: buffer.length,
        qualityScore,
      },
      webp: webpBuffer,
    };
  }

  async generateThumbnails(buffer: Buffer): Promise<Thumbnails> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Cannot read image dimensions');
    }

    const aspectRatio = metadata.width / metadata.height;

    const thumb = await sharp(buffer)
      .resize(150, 150, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toBuffer();

    const small = await sharp(buffer)
      .resize(300, Math.round(300 / aspectRatio), {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const medium = await sharp(buffer)
      .resize(600, Math.round(600 / aspectRatio), {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const large = await sharp(buffer)
      .resize(1000, Math.round(1000 / aspectRatio), {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();

    const full = await sharp(buffer)
      .resize(1500, Math.round(1500 / aspectRatio), {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 92 })
      .toBuffer();

    return { thumb, small, medium, large, full };
  }

  async stripExif(buffer: Buffer): Promise<Buffer> {
    try {
      const data = buffer.toString('binary');
      const removed = piexifjs.remove(data);
      return Buffer.from(removed, 'binary');
    } catch {
      return buffer;
    }
  }

  async convertToWebP(buffer: Buffer, quality = 80): Promise<Buffer> {
    return sharp(buffer).webp({ quality }).toBuffer();
  }

  async smartCrop(
    buffer: Buffer,
    targetAspect: number = 1,
  ): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return buffer;
    }

    const currentAspect = metadata.width / metadata.height;

    if (Math.abs(currentAspect - targetAspect) < 0.05) {
      return buffer;
    }

    if (currentAspect > targetAspect) {
      const newWidth = Math.round(metadata.height * targetAspect);
      const left = Math.round((metadata.width - newWidth) / 2);
      return sharp(buffer)
        .extract({
          left,
          top: 0,
          width: newWidth,
          height: metadata.height,
        })
        .toBuffer();
    } else {
      const newHeight = Math.round(metadata.width / targetAspect);
      const top = Math.round((metadata.height - newHeight) / 2);
      return sharp(buffer)
        .extract({
          left: 0,
          top,
          width: metadata.width,
          height: newHeight,
        })
        .toBuffer();
    }
  }

  async analyzeQuality(buffer: Buffer): Promise<QualityScore> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const warnings: string[] = [];

    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = data.length / info.channels;
    const sharpness = this.calculateSharpness(data, info);
    const brightness = this.calculateBrightness(data, info);
    const contrast = this.calculateContrast(data, info);

    if (sharpness < 30) {
      warnings.push('Image is blurry');
    }
    if (brightness < 20 || brightness > 230) {
      warnings.push('Image is too dark or bright');
    }
    if (contrast < 15) {
      warnings.push('Low contrast');
    }

    const overall = Math.round((sharpness + brightness / 2.3 + contrast * 2) / 4);

    return {
      sharpness: Math.min(100, Math.round(sharpness)),
      brightness: Math.min(100, Math.round(brightness / 2.55)),
      contrast: Math.min(100, Math.round(contrast / 2.55)),
      overall: Math.min(100, Math.max(0, overall)),
      warnings,
    };
  }

  private calculateSharpness(data: Buffer, info: any): number {
    const width = info.width;
    const height = info.height;
    let laplacianSum = 0;
    let pixelsAnalyzed = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * info.channels;
        const center = data[idx];

        const neighbors = [
          data[(y - 1) * width * info.channels + idx],
          data[(y + 1) * width * info.channels + idx],
          data[idx - info.channels],
          data[idx + info.channels],
        ];

        const avg = neighbors.reduce((a, b) => a + b, 0) / 4;
        laplacianSum += Math.abs(center - avg);
        pixelsAnalyzed++;

        if (pixelsAnalyzed > 10000) break;
      }
      if (pixelsAnalyzed > 10000) break;
    }

    return Math.min(100, (laplacianSum / pixelsAnalyzed) * 0.5);
  }

  private calculateBrightness(data: Buffer, info: any): number {
    let sum = 0;
    for (let i = 0; i < Math.min(data.length, 50000); i += info.channels) {
      sum += data[i];
    }
    return sum / (Math.min(data.length, 50000) / info.channels);
  }

  private calculateContrast(data: Buffer, info: any): number {
    const brightness = this.calculateBrightness(data, info);
    let varianceSum = 0;
    let count = 0;

    for (let i = 0; i < Math.min(data.length, 50000); i += info.channels) {
      varianceSum += Math.pow(data[i] - brightness, 2);
      count++;
    }

    return Math.sqrt(varianceSum / count);
  }

  generateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async detectDuplicatesByHash(buffer: Buffer, existingHashes: string[]): Promise<boolean> {
    const hash = this.generateHash(buffer);
    return existingHashes.includes(hash);
  }

  detectNsfw(buffer: Buffer): { flagged: boolean; confidence: number } {
    return { flagged: false, confidence: 0 };
  }

  detectFaces(buffer: Buffer): { count: number; boxes: any[] } {
    return { count: 0, boxes: [] };
  }

  detectWatermark(buffer: Buffer): boolean {
    return false;
  }
}
