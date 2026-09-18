import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsEvent } from './analytics-events.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(AnalyticsEvent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('trackEvent', () => {
    it('should track listing view', async () => {
      mockRepository.create.mockReturnValue({});
      await service.trackListingView(123, 1, 'search');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should track contact click', async () => {
      mockRepository.create.mockReturnValue({});
      await service.trackContactButtonClick(123, 1, 'whatsapp');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should track wishlist add', async () => {
      mockRepository.create.mockReturnValue({});
      await service.trackWishlistAdd(123, 1);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should track search', async () => {
      mockRepository.create.mockReturnValue({});
      await service.trackSearch('iphone', 5);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('getListingStats', () => {
    it('should return listing statistics', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
      });

      const stats = await service.getListingStats(123);

      expect(stats).toBeDefined();
      expect(stats.views).toBeGreaterThanOrEqual(0);
      expect(stats.ctr).toBeGreaterThanOrEqual(0);
    });

    it('should calculate CTR correctly', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn()
          .mockResolvedValueOnce(100) // views
          .mockResolvedValueOnce(10)  // clicks
          .mockResolvedValueOnce(5)   // contacts
          .mockResolvedValueOnce(3),  // wishlist
      });

      const stats = await service.getListingStats(123);

      expect(stats.views).toBe(100);
      expect(stats.ctr).toBe(10);
    });

    it('should handle zero views', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      });

      const stats = await service.getListingStats(123);

      expect(stats.ctr).toBe(0);
    });
  });

  describe('getTrendingListings', () => {
    it('should return trending listings', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { event_listingId: 1, count: 50 },
          { event_listingId: 2, count: 45 },
        ]),
      });

      const trending = await service.getTrendingListings(10);

      expect(trending).toBeDefined();
      expect(trending.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getUserFunnel', () => {
    it('should calculate user funnel', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn()
          .mockResolvedValueOnce(1000) // browse
          .mockResolvedValueOnce(500)  // view
          .mockResolvedValueOnce(50)   // contact
          .mockResolvedValueOnce(30),  // wishlist
      });

      const funnel = await service.getUserFunnel();

      expect(funnel.browse).toBe(1000);
      expect(funnel.view).toBe(500);
      expect(funnel.dropoff_view_to_contact).toBeGreaterThan(0);
    });
  });

  describe('getSearchMetrics', () => {
    it('should return search metrics', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            eventType: 'search',
            metadata: { query: 'iphone', results_count: 5 },
          },
          {
            eventType: 'search',
            metadata: { query: 'iphone', results_count: 5 },
          },
          { eventType: 'search', metadata: { query: 'samsung', results_count: 3 } },
        ]),
      });

      const metrics = await service.getSearchMetrics();

      expect(metrics.top_queries).toBeDefined();
      expect(metrics.no_result_searches).toBeGreaterThanOrEqual(0);
      expect(metrics.avg_ctr).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSellerPerformance', () => {
    it('should return seller performance metrics', async () => {
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn()
          .mockResolvedValueOnce(100) // views
          .mockResolvedValueOnce(10)  // contacts
          .mockResolvedValueOnce(5),  // messages
      });

      const performance = await service.getSellerPerformance(1);

      expect(performance.userId).toBe(1);
      expect(performance.views).toBe(100);
      expect(performance.contacts).toBe(10);
    });
  });

  describe('getCategoryPerformance', () => {
    it('should return category performance', async () => {
      const performance = await service.getCategoryPerformance();

      expect(performance).toBeDefined();
      expect(Array.isArray(performance)).toBe(true);
    });
  });
});
