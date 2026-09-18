import { Test, TestingModule } from '@nestjs/testing';
import { BatchOperationsService } from './batch-operations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Listing } from './listing.entity';
import { FeaturedListing } from './featured-listing.entity';
import { BadRequestException } from '@nestjs/common';

describe('BatchOperationsService', () => {
  let service: BatchOperationsService;
  let mockListingsRepository: any;
  let mockFeaturedListingsRepository: any;

  beforeEach(async () => {
    mockListingsRepository = {
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findOne: jest.fn(),
    };

    mockFeaturedListingsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchOperationsService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingsRepository,
        },
        {
          provide: getRepositoryToken(FeaturedListing),
          useValue: mockFeaturedListingsRepository,
        },
      ],
    }).compile();

    service = module.get<BatchOperationsService>(BatchOperationsService);
  });

  describe('batchEdit', () => {
    it('should update multiple listings', async () => {
      const listings = [
        { id: 1, userId: 1, price: 1000, category: 'electronics' },
        { id: 2, userId: 1, price: 2000, category: 'electronics' },
      ];

      mockListingsRepository.find.mockResolvedValue(listings);
      mockListingsRepository.save.mockResolvedValue({});

      const result = await service.batchEdit(
        [1, 2],
        { price: 1500 },
        1,
      );

      expect(result.updated_count).toBe(2);
      expect(mockListingsRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should reject empty listing IDs', async () => {
      await expect(
        service.batchEdit([], { price: 1500 }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject more than 100 listings', async () => {
      const ids = Array.from({ length: 101 }, (_, i) => i + 1);

      await expect(
        service.batchEdit(ids, { price: 1500 }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject empty updates', async () => {
      await expect(
        service.batchEdit([1, 2], {}, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unauthorized access', async () => {
      const listings = [
        { id: 1, userId: 2, price: 1000 },
      ];

      mockListingsRepository.find.mockResolvedValue(listings);

      const result = await service.batchEdit([1], { price: 1500 }, 1);

      expect(result.updated_count).toBe(0);
      expect(result.failed_count).toBe(1);
    });
  });

  describe('batchFeature', () => {
    it('should feature multiple listings as free', async () => {
      const listings = [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 },
      ];

      mockListingsRepository.find.mockResolvedValue(listings);
      mockFeaturedListingsRepository.findOne.mockResolvedValue(null);
      mockFeaturedListingsRepository.create.mockReturnValue({});

      const result = await service.batchFeature([1, 2], 'free', 1);

      expect(result.updated_count).toBe(2);
    });

    it('should upgrade existing featured listing to premium', async () => {
      const listings = [{ id: 1, userId: 1 }];
      const existing = { id: 1, priceTier: 'free', listingId: 1 };

      mockListingsRepository.find.mockResolvedValue(listings);
      mockFeaturedListingsRepository.findOne.mockResolvedValue(existing);

      const result = await service.batchFeature([1], 'premium', 1);

      expect(result.updated_count).toBe(1);
    });

    it('should reject more than 50 listings for featuring', async () => {
      const ids = Array.from({ length: 51 }, (_, i) => i + 1);

      await expect(
        service.batchFeature(ids, 'free', 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('batchDelete', () => {
    it('should delete multiple listings', async () => {
      const listings = [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 },
      ];

      mockListingsRepository.find.mockResolvedValue(listings);
      mockListingsRepository.remove.mockResolvedValue({});

      const result = await service.batchDelete([1, 2], 1);

      expect(result.updated_count).toBe(2);
      expect(mockListingsRepository.remove).toHaveBeenCalledTimes(2);
    });

    it('should reject empty listing IDs', async () => {
      await expect(
        service.batchDelete([], 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should respect authorization', async () => {
      const listings = [
        { id: 1, userId: 2 },
      ];

      mockListingsRepository.find.mockResolvedValue(listings);

      const result = await service.batchDelete([1], 1);

      expect(result.updated_count).toBe(0);
      expect(result.failed_count).toBe(1);
    });
  });

  describe('batchStatusChange', () => {
    it('should validate status values', async () => {
      await expect(
        service.batchStatusChange([1], 'invalid' as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid status values', async () => {
      const listings = [{ id: 1, userId: 1 }];
      mockListingsRepository.find.mockResolvedValue(listings);
      mockListingsRepository.save.mockResolvedValue({});

      const result = await service.batchStatusChange([1], 'sold', 1);

      expect(result).toBeDefined();
    });
  });

  describe('batchRenew', () => {
    it('should renew multiple listings', async () => {
      const listings = [
        { id: 1, userId: 1, expiresAt: new Date() },
        { id: 2, userId: 1, expiresAt: new Date() },
      ];

      mockListingsRepository.find.mockResolvedValue(listings);
      mockListingsRepository.save.mockResolvedValue({});

      const result = await service.batchRenew([1, 2], 1);

      expect(result.updated_count).toBe(2);
    });

    it('should reject more than 50 listings for renewal', async () => {
      const ids = Array.from({ length: 51 }, (_, i) => i + 1);

      await expect(
        service.batchRenew(ids, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateBatchSize', () => {
    it('should accept valid batch size', () => {
      expect(() => service.validateBatchSize(50, 100)).not.toThrow();
    });

    it('should reject oversized batch', () => {
      expect(() => service.validateBatchSize(101, 100)).toThrow(
        BadRequestException,
      );
    });
  });
});
