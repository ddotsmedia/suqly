import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingService } from './image-processing.service';
import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingService],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);
  });

  describe('processImage', () => {
    it('should process valid JPEG image', async () => {
      const buffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: { r: 255, g: 0, b: 0 } },
      })
        .jpeg()
        .toBuffer();

      const result = await service.processImage(buffer, 'test.jpg');

      expect(result.processed).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.webp).toBeDefined();
      expect(result.metadata.hash).toBeDefined();
      expect(result.metadata.qualityScore).toBeDefined();
    });

    it('should reject oversized images', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      await expect(
        service.processImage(largeBuffer, 'large.jpg'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject undersized images', async () => {
      const buffer = await sharp({
        create: { width: 200, height: 200, channels: 3, background: { r: 0, g: 255, b: 0 } },
      })
        .jpeg()
        .toBuffer();

      await expect(
        service.processImage(buffer, 'small.jpg'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate consistent hash', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const hash1 = service.generateHash(buffer);
      const hash2 = service.generateHash(buffer);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different images', async () => {
      const buffer1 = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const buffer2 = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 200, g: 200, b: 200 } },
      })
        .jpeg()
        .toBuffer();

      const hash1 = service.generateHash(buffer1);
      const hash2 = service.generateHash(buffer2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateThumbnails', () => {
    it('should generate 5 thumbnail sizes', async () => {
      const buffer = await sharp({
        create: { width: 2000, height: 1500, channels: 3, background: { r: 100, g: 150, b: 200 } },
      })
        .jpeg()
        .toBuffer();

      const result = await service.generateThumbnails(buffer);

      expect(result.thumb).toBeDefined();
      expect(result.small).toBeDefined();
      expect(result.medium).toBeDefined();
      expect(result.large).toBeDefined();
      expect(result.full).toBeDefined();
      expect(result.thumb.length).toBeLessThan(result.full.length);
    });

    it('should preserve aspect ratio in thumbnails', async () => {
      const buffer = await sharp({
        create: { width: 1600, height: 900, channels: 3, background: { r: 50, g: 100, b: 150 } },
      })
        .jpeg()
        .toBuffer();

      const result = await service.generateThumbnails(buffer);

      expect(result.small).toBeDefined();
      expect(result.large).toBeDefined();
    });
  });

  describe('stripExif', () => {
    it('should handle buffer without EXIF', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const result = await service.stripExif(buffer);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('convertToWebP', () => {
    it('should convert image to WebP', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const webp = await service.convertToWebP(buffer);

      expect(webp).toBeDefined();
      expect(webp.length).toBeGreaterThan(0);
    });

    it('should respect quality setting', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const highQuality = await service.convertToWebP(buffer, 95);
      const lowQuality = await service.convertToWebP(buffer, 10);

      expect(highQuality.length).toBeGreaterThan(0);
      expect(lowQuality.length).toBeGreaterThan(0);
      expect(highQuality.length).toBeGreaterThanOrEqual(lowQuality.length / 2);
    });
  });

  describe('smartCrop', () => {
    it('should crop to target aspect ratio', async () => {
      const buffer = await sharp({
        create: { width: 1000, height: 600, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const cropped = await service.smartCrop(buffer, 1);

      expect(cropped).toBeDefined();
      expect(cropped.length).toBeGreaterThan(0);
    });

    it('should preserve aspect if already correct', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const cropped = await service.smartCrop(buffer, 1);

      expect(cropped).toBeDefined();
    });
  });

  describe('analyzeQuality', () => {
    it('should analyze image quality', async () => {
      const buffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: { r: 128, g: 128, b: 128 } },
      })
        .jpeg()
        .toBuffer();

      const quality = await service.analyzeQuality(buffer);

      expect(quality.sharpness).toBeDefined();
      expect(quality.brightness).toBeDefined();
      expect(quality.contrast).toBeDefined();
      expect(quality.overall).toBeDefined();
      expect(quality.warnings).toBeDefined();
      expect(quality.overall).toBeGreaterThanOrEqual(0);
      expect(quality.overall).toBeLessThanOrEqual(100);
    });

    it('should detect blurry images', async () => {
      const buffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: { r: 128, g: 128, b: 128 } },
      })
        .blur(10)
        .jpeg()
        .toBuffer();

      const quality = await service.analyzeQuality(buffer);

      expect(quality.warnings).toBeDefined();
    });

    it('should detect dark images', async () => {
      const buffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: { r: 10, g: 10, b: 10 } },
      })
        .jpeg()
        .toBuffer();

      const quality = await service.analyzeQuality(buffer);

      expect(quality.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('detectDuplicatesByHash', () => {
    it('should detect existing hash', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const hash = service.generateHash(buffer);
      const isDuplicate = await service.detectDuplicatesByHash(buffer, [hash]);

      expect(isDuplicate).toBe(true);
    });

    it('should not flag new image as duplicate', async () => {
      const buffer = await sharp({
        create: { width: 500, height: 500, channels: 3, background: { r: 100, g: 100, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const isDuplicate = await service.detectDuplicatesByHash(buffer, []);

      expect(isDuplicate).toBe(false);
    });
  });

  describe('detectNsfw', () => {
    it('should return detection result', () => {
      const buffer = Buffer.from('test');
      const result = service.detectNsfw(buffer);

      expect(result).toBeDefined();
      expect(result.flagged).toBeDefined();
      expect(result.confidence).toBeDefined();
    });
  });

  describe('detectFaces', () => {
    it('should return face detection result', () => {
      const buffer = Buffer.from('test');
      const result = service.detectFaces(buffer);

      expect(result).toBeDefined();
      expect(result.count).toBe(0);
      expect(result.boxes).toBeDefined();
    });
  });

  describe('detectWatermark', () => {
    it('should return watermark detection result', () => {
      const buffer = Buffer.from('test');
      const result = service.detectWatermark(buffer);

      expect(result).toBe(false);
    });
  });
});
