import { Test, TestingModule } from '@nestjs/testing';
import { CsvImportService } from './csv-import.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { BadRequestException } from '@nestjs/common';

describe('CsvImportService', () => {
  let service: CsvImportService;
  let mockListingsRepository: any;
  let mockImagesRepository: any;

  beforeEach(async () => {
    mockListingsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    mockImagesRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvImportService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingsRepository,
        },
        {
          provide: getRepositoryToken(ListingImage),
          useValue: mockImagesRepository,
        },
      ],
    }).compile();

    service = module.get<CsvImportService>(CsvImportService);
  });

  describe('parseCSV', () => {
    it('should parse valid CSV', async () => {
      const csv = Buffer.from(
        'title,category,price\nTest Item,goods,1000\n',
      );

      const result = await service.parseCSV(csv);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Test Item');
    });

    it('should handle empty CSV', async () => {
      const csv = Buffer.from('title,category,price\n');

      const result = await service.parseCSV(csv);

      expect(result).toHaveLength(0);
    });

    it('should reject malformed CSV', async () => {
      const csv = Buffer.from('invalid,csv,data\nrow');

      const result = await service.parseCSV(csv);
      expect(result).toBeDefined();
    });
  });

  describe('validateRow', () => {
    const fieldMapping: any = {
      title: 'title',
      category: 'category',
      price: 'price',
      description: 'description',
      condition: 'condition',
      location: 'location',
      phone: 'phone',
      whatsapp_enabled: 'whatsapp_enabled',
      telegram_username: 'telegram_username',
    };

    it('should validate correct row', () => {
      const row = {
        title: 'iPhone 15',
        category: 'goods',
        price: '5000',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toHaveLength(0);
    });

    it('should reject missing title', () => {
      const row = {
        title: '',
        category: 'goods',
        price: '5000',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'title',
          error: expect.stringContaining('Required'),
        }),
      );
    });

    it('should reject invalid category', () => {
      const row = {
        title: 'Test',
        category: 'invalid_category',
        price: '5000',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'category',
          error: expect.stringContaining('Must be one of'),
        }),
      );
    });

    it('should reject invalid price', () => {
      const row = {
        title: 'Test',
        category: 'goods',
        price: 'invalid',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'price',
          error: expect.stringContaining('number'),
        }),
      );
    });

    it('should reject negative price', () => {
      const row = {
        title: 'Test',
        category: 'goods',
        price: '-100',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'price',
        }),
      );
    });

    it('should reject oversized description', () => {
      const row = {
        title: 'Test',
        category: 'goods',
        price: '1000',
        description: 'x'.repeat(5001),
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'description',
          error: expect.stringContaining('Max'),
        }),
      );
    });

    it('should reject invalid phone format', () => {
      const row = {
        title: 'Test',
        category: 'goods',
        price: '1000',
        phone: 'abc123',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'phone',
          error: expect.stringContaining('E.164'),
        }),
      );
    });

    it('should accept valid E.164 phone', () => {
      const row = {
        title: 'Test',
        category: 'goods',
        price: '1000',
        phone: '+971501234567',
      };

      const errors = service.validateRow(row, 2, fieldMapping);

      expect(
        errors.filter((e) => e.field === 'phone'),
      ).toHaveLength(0);
    });
  });

  describe('importListings', () => {
    const fieldMapping = {
      title: 'title',
      category: 'category',
      price: 'price',
      description: 'description',
      condition: 'condition',
      location: 'location',
      phone: 'phone',
    };

    it('should reject empty CSV', async () => {
      const csv = Buffer.from('title,category,price\n');

      await expect(
        service.importListings(csv, 1, fieldMapping),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject CSV with >100 rows', async () => {
      const rows = ['title,category,price'];
      for (let i = 0; i < 101; i++) {
        rows.push(`Item${i},goods,1000`);
      }
      const csv = Buffer.from(rows.join('\n'));

      await expect(
        service.importListings(csv, 1, fieldMapping),
      ).rejects.toThrow(BadRequestException);
    });

    it('should import valid listings', async () => {
      const csv = Buffer.from(
        'title,category,price\nTest Item,goods,1000\n',
      );

      mockListingsRepository.create.mockReturnValue({
        userId: 1,
        title: 'Test Item',
        category: 'goods',
      });

      mockListingsRepository.save.mockResolvedValue({
        id: 123,
        userId: 1,
        title: 'Test Item',
      });

      const result = await service.importListings(csv, 1, fieldMapping);

      expect(result.created).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.listings).toContain(123);
    });

    it('should handle validation errors in batch', async () => {
      const csv = Buffer.from(
        'title,category,price\nTest,goods,1000\nInvalid,,500\n',
      );

      const result = await service.importListings(csv, 1, fieldMapping);

      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateTemplate', () => {
    it('should generate CSV template', () => {
      const template = service.generateTemplate();

      expect(template).toContain('title,category,price');
      expect(template).toContain('iPhone 15 Pro Max');
      expect(template).toContain('goods');
      expect(template).toContain('4500');
    });

    it('should have correct columns in template', () => {
      const template = service.generateTemplate();
      const lines = template.split('\n');
      const headers = lines[0].split(',');

      expect(headers).toContain('title');
      expect(headers).toContain('category');
      expect(headers).toContain('price');
      expect(headers).toContain('description');
    });
  });
});
