import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeaturedListingsService } from './featured-listings.service';
import { FeaturedListing } from './featured-listing.entity';
import { Listing } from './listing.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FeaturedListingsService', () => {
  let service: FeaturedListingsService;
  const mockFeaturedRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };
  const mockListingRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturedListingsService,
        {
          provide: getRepositoryToken(FeaturedListing),
          useValue: mockFeaturedRepository,
        },
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
      ],
    }).compile();

    service = module.get<FeaturedListingsService>(FeaturedListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should feature listing free', async () => {
    const listing = { id: 1, userId: 1, title: 'Test' };
    const featured = {
      id: 1,
      listingId: 1,
      priceTier: 'free',
      isActive: true,
      expiresAt: new Date(),
    };

    mockListingRepository.findOne.mockResolvedValue(listing);
    mockFeaturedRepository.findOne.mockResolvedValue(null);
    mockFeaturedRepository.create.mockReturnValue(featured);
    mockFeaturedRepository.save.mockResolvedValue(featured);

    const result = await service.featureListingFree(1, 1);

    expect(result.priceTier).toBe('free');
    expect(result.isActive).toBe(true);
  });

  it('should throw ConflictException if already featured', async () => {
    mockListingRepository.findOne.mockResolvedValue({ id: 1, userId: 1 });
    mockFeaturedRepository.findOne.mockResolvedValue({ id: 1, isActive: true });

    await expect(service.featureListingFree(1, 1)).rejects.toThrow(ConflictException);
  });

  it('should feature listing premium', async () => {
    const listing = { id: 1, userId: 1, title: 'Test' };
    const featured = {
      id: 1,
      listingId: 1,
      priceTier: 'premium',
      pricePaid: 50,
      isActive: true,
      paymentId: 'pay_123',
    };

    mockListingRepository.findOne.mockResolvedValue(listing);
    mockFeaturedRepository.findOne.mockResolvedValue(null);
    mockFeaturedRepository.create.mockReturnValue(featured);
    mockFeaturedRepository.save.mockResolvedValue(featured);

    const result = await service.featureListingPremium(1, 1, 'pay_123');

    expect(result.priceTier).toBe('premium');
    expect(result.pricePaid).toBe(50);
  });

  it('should unfeature listing', async () => {
    const featured = {
      id: 1,
      listingId: 1,
      isActive: true,
      listing: { userId: 1 },
    };

    mockFeaturedRepository.findOne.mockResolvedValue(featured);
    mockFeaturedRepository.save.mockResolvedValue({ ...featured, isActive: false });

    const result = await service.unfeatureListing(1, 1);

    expect(result).toBe(true);
  });

  it('should get featured listings', async () => {
    const listings = [
      {
        id: 1,
        listingId: 1,
        priceTier: 'free',
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    mockFeaturedRepository.find.mockResolvedValue(listings);

    const result = await service.getFeaturedListings(10);

    expect(result.length).toBe(1);
  });

  it('should check and expire listings', async () => {
    const expired = {
      id: 1,
      listingId: 1,
      isActive: true,
      expiresAt: new Date(Date.now() - 1000),
    };

    mockFeaturedRepository.find.mockResolvedValue([expired]);
    mockFeaturedRepository.save.mockResolvedValue({ ...expired, isActive: false });

    await service.checkAndExpireListings();

    expect(mockFeaturedRepository.save).toHaveBeenCalled();
  });

  it('should get listing featured status', async () => {
    const featured = {
      id: 1,
      listingId: 1,
      isActive: true,
      priceTier: 'premium',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    mockFeaturedRepository.findOne.mockResolvedValue(featured);

    const result = await service.getListingFeaturedStatus(1);

    expect(result.isFeatured).toBe(true);
    expect(result.tier).toBe('premium');
    expect(result.daysRemaining).toBeGreaterThan(0);
  });

  it('should renew featured premium', async () => {
    const featured = {
      id: 1,
      listingId: 1,
      isActive: true,
      listing: { userId: 1 },
    };

    mockFeaturedRepository.findOne.mockResolvedValue(featured);
    mockFeaturedRepository.save.mockResolvedValue({
      ...featured,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const result = await service.renewFeaturedPremium(1, 1, 'pay_456');

    expect(result.isActive).toBe(true);
  });

  it('should get admin featured listings', async () => {
    const listings = [{ id: 1, listingId: 1, priceTier: 'free' }];

    mockFeaturedRepository.findAndCount.mockResolvedValue([listings, 1]);

    const result = await service.getAdminFeaturedListings(20, 0);

    expect(result.total).toBe(1);
    expect(result.items.length).toBe(1);
  });
});
