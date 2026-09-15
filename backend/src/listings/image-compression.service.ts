import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageCompressionService {
  async compressImage(buffer: Buffer, format: 'jpeg' | 'webp' = 'jpeg'): Promise<{
    thumbnail: Buffer;
    full: Buffer;
  }> {
    const thumbnail = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .toFormat(format, { quality: 80 })
      .toBuffer();

    const full = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .toFormat(format, { quality: 85 })
      .toBuffer();

    return { thumbnail, full };
  }

  async getImageMetadata(buffer: Buffer): Promise<any> {
    return sharp(buffer).metadata();
  }
}
