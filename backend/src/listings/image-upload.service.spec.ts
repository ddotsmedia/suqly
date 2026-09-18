import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image-upload.service';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageUploadService],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
  });

  describe('validateAndCompressImage', () => {
    it('should compress JPEG image successfully', async () => {
      const buffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const file = {
        buffer,
        mimetype: 'image/jpeg',
        size: buffer.length,
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const result = await service.validateAndCompressImage(file);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.thumbnailBuffer).toBeDefined();
      expect(result.fullBuffer).toBeDefined();
    });

    it('should compress PNG image successfully', async () => {
      const buffer = await sharp({
        create: {
          width: 1000,
          height: 800,
          channels: 4,
          background: { r: 0, g: 255, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const file = {
        buffer,
        mimetype: 'image/png',
        size: buffer.length,
        originalname: 'test.png',
      } as Express.Multer.File;

      const result = await service.validateAndCompressImage(file);

      expect(result.thumbnailBuffer.length).toBeLessThan(buffer.length);
    });

    it('should reject oversized images', async () => {
      const file = {
        buffer: Buffer.alloc(6 * 1024 * 1024),
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
        originalname: 'large.jpg',
      } as Express.Multer.File;

      await expect(service.validateAndCompressImage(file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject invalid image format', async () => {
      const file = {
        buffer: Buffer.from('fake'),
        mimetype: 'image/bmp',
        size: 100,
        originalname: 'test.bmp',
      } as Express.Multer.File;

      await expect(service.validateAndCompressImage(file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject image with insufficient dimensions', async () => {
      const buffer = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const file = {
        buffer,
        mimetype: 'image/jpeg',
        size: buffer.length,
        originalname: 'small.jpg',
      } as Express.Multer.File;

      await expect(service.validateAndCompressImage(file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject missing file', async () => {
      await expect(service.validateAndCompressImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate multiple images', async () => {
      const buffer = await sharp({
        create: {
          width: 500,
          height: 400,
          channels: 3,
          background: { r: 0, g: 0, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();

      const files = Array(5)
        .fill(null)
        .map(
          () =>
            ({
              buffer,
              mimetype: 'image/jpeg',
              size: buffer.length,
              originalname: 'test.jpg',
            }) as Express.Multer.File,
        );

      await expect(service.validateMultipleImages(files)).resolves.not.toThrow();
    });

    it('should reject more than 10 images', async () => {
      const buffer = Buffer.alloc(100);
      const files = Array(11)
        .fill(null)
        .map(
          () =>
            ({
              buffer,
              mimetype: 'image/jpeg',
              size: 100,
              originalname: 'test.jpg',
            }) as Express.Multer.File,
        );

      await expect(service.validateMultipleImages(files)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getImageUrl', () => {
    it('should generate thumbnail URL', () => {
      const url = service.getImageUrl('test-123', 'thumbnail');
      expect(url).toContain('test-123-thumbnail');
      expect(url).toContain('.webp');
    });

    it('should generate full image URL', () => {
      const url = service.getImageUrl('test-456', 'full');
      expect(url).toContain('test-456-full');
      expect(url).toContain('.webp');
    });
  });
});
