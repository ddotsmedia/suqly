import { Test, TestingModule } from '@nestjs/testing';
import {
  FeaturedListingsController,
  FeaturedListingsAdminController,
  FeaturedListingsManagementController,
} from './featured-listings.controller';
import { FeaturedListingsService } from './featured-listings.service';

describe('FeaturedListingsController', () => {
  let controller: FeaturedListingsController;
  const mockService = {
    getFeaturedListings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturedListingsController],
      providers: [
        {
          provide: FeaturedListingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FeaturedListingsController>(FeaturedListingsController);
  });

  it('should get featured listings', async () => {
    const listings = [{ id: 1, listingId: 1, priceTier: 'free' }];
    mockService.getFeaturedListings.mockResolvedValue(listings);

    const result = await controller.getFeaturedListings(10);

    expect(result.length).toBe(1);
  });
});

describe('FeaturedListingsAdminController', () => {
  let controller: FeaturedListingsAdminController;
  const mockService = {
    featureListingFree: jest.fn(),
    featureListingPremium: jest.fn(),
    unfeatureListing: jest.fn(),
    getListingFeaturedStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturedListingsAdminController],
      providers: [
        {
          provide: FeaturedListingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FeaturedListingsAdminController>(
      FeaturedListingsAdminController,
    );
  });

  it('should feature listing free', async () => {
    const req = { user: { id: 1 } };
    const featured = { id: 1, priceTier: 'free' };
    mockService.featureListingFree.mockResolvedValue(featured);

    const result = await controller.featureListingFree(req, 1);

    expect(result.priceTier).toBe('free');
  });

  it('should feature listing premium', async () => {
    const req = { user: { id: 1 } };
    const featured = { id: 1, priceTier: 'premium' };
    mockService.featureListingPremium.mockResolvedValue(featured);

    const result = await controller.featureListingPremium(req, 1, { paymentId: 'pay_123' });

    expect(result.priceTier).toBe('premium');
  });

  it('should unfeature listing', async () => {
    const req = { user: { id: 1 } };
    mockService.unfeatureListing.mockResolvedValue(true);

    const result = await controller.unfeatureListing(req, 1);

    expect(result.success).toBe(true);
  });

  it('should get featured status', async () => {
    const status = { isFeatured: true, tier: 'free', daysRemaining: 3 };
    mockService.getListingFeaturedStatus.mockResolvedValue(status);

    const result = await controller.getFeaturedStatus(1);

    expect(result.isFeatured).toBe(true);
  });
});

describe('FeaturedListingsManagementController', () => {
  let controller: FeaturedListingsManagementController;
  const mockService = {
    getAdminFeaturedListings: jest.fn(),
    renewFeaturedPremium: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturedListingsManagementController],
      providers: [
        {
          provide: FeaturedListingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FeaturedListingsManagementController>(
      FeaturedListingsManagementController,
    );
  });

  it('should get admin featured listings', async () => {
    const result = { items: [{ id: 1 }], total: 1 };
    mockService.getAdminFeaturedListings.mockResolvedValue(result);

    const response = await controller.getAdminFeaturedListings(20, 0);

    expect(response.total).toBe(1);
  });

  it('should renew featured premium', async () => {
    const req = { user: { id: 1 } };
    const featured = { id: 1, priceTier: 'premium' };
    mockService.renewFeaturedPremium.mockResolvedValue(featured);

    const result = await controller.renewFeaturedPremium(req, 1, {
      paymentId: 'pay_456',
    });

    expect(result.priceTier).toBe('premium');
  });
});
