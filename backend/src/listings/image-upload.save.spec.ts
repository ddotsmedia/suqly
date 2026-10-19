import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { ImageUploadService } from './image-upload.service';

describe('ImageUploadService save', () => {
  it('compresses a photo to webp, writes both sizes and returns their URLs', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'suqly-img-'));
    const service = new ImageUploadService();
    (service as any).uploadDir = dir;
    process.env.IMAGE_BASE_URL = 'https://example.test';

    const buffer = await sharp({
      create: { width: 1600, height: 1200, channels: 3, background: '#3366cc' },
    }).jpeg().toBuffer();
    const file = { buffer, size: buffer.length, mimetype: 'image/jpeg', originalname: 'a.jpg' } as any;

    const compressed = await service.validateAndCompressImage(file);
    const urls = await service.saveImages(compressed);

    expect(urls.fullUrl).toMatch(/^https:\/\/example\.test\/uploads\/.+-full\.webp$/);
    expect(urls.thumbnailUrl).toMatch(/-thumbnail\.webp$/);
    const full = await sharp(path.join(dir, `${compressed.filename}-full.webp`)).metadata();
    const thumb = await sharp(path.join(dir, `${compressed.filename}-thumbnail.webp`)).metadata();
    expect(full.format).toBe('webp');
    expect(full.width).toBe(1200);
    expect(thumb.width).toBe(300);
    expect(thumb.height).toBe(300);
    await fs.rm(dir, { recursive: true, force: true });
  });
});
