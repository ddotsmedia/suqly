import { Test, TestingModule } from '@nestjs/testing';
import { SeoAuditService } from './seo-audit.service';

describe('SeoAuditService', () => {
  let service: SeoAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeoAuditService],
    }).compile();

    service = module.get<SeoAuditService>(SeoAuditService);
  });

  describe('auditListing', () => {
    it('should audit complete listing', () => {
      const listing = {
        id: 1,
        title: 'iPhone 15 Pro Max - Perfect Condition',
        description:
          'Brand new iPhone 15 Pro Max in perfect condition with original box and accessories included',
        category: 'electronics',
        emirate: 'dubai',
        price: 5000,
        images: [
          {
            fullUrl: 'https://example.com/image1.jpg',
            altText: 'iPhone 15 Pro Max',
            qualityScore: 85,
          },
          {
            fullUrl: 'https://example.com/image2.jpg',
            altText: 'Phone back view',
            qualityScore: 90,
          },
        ],
      };

      const result = service.auditListing(listing);

      expect(result.score).toBeGreaterThan(70);
      expect(result.issues.length).toBeLessThan(5);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect missing title', () => {
      const listing = {
        description: 'Test',
        category: 'goods',
        emirate: 'dubai',
      };

      const result = service.auditListing(listing);

      expect(result.score).toBeLessThan(80);
      const titleIssue = result.issues.find((i) => i.type === 'missing_title');
      expect(titleIssue).toBeDefined();
      expect(titleIssue?.severity).toBe('critical');
    });

    it('should detect short title', () => {
      const listing = {
        title: 'Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
      };

      const result = service.auditListing(listing);

      const shortTitleIssue = result.issues.find((i) => i.type === 'short_title');
      expect(shortTitleIssue).toBeDefined();
    });

    it('should detect long title', () => {
      const listing = {
        title: 'A'.repeat(70),
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
      };

      const result = service.auditListing(listing);

      const longTitleIssue = result.issues.find((i) => i.type === 'long_title');
      expect(longTitleIssue).toBeDefined();
    });

    it('should detect missing description', () => {
      const listing = {
        title: 'Test Item',
        category: 'goods',
        emirate: 'dubai',
      };

      const result = service.auditListing(listing);

      const descIssue = result.issues.find(
        (i) => i.type === 'missing_description',
      );
      expect(descIssue).toBeDefined();
      expect(descIssue?.severity).toBe('critical');
    });

    it('should detect missing images', () => {
      const listing = {
        title: 'Test Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
        images: [],
      };

      const result = service.auditListing(listing);

      const imageIssue = result.issues.find((i) => i.type === 'missing_images');
      expect(imageIssue).toBeDefined();
      expect(imageIssue?.severity).toBe('critical');
    });

    it('should detect few images', () => {
      const listing = {
        title: 'Test Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
        images: [{ fullUrl: 'test.jpg' }],
      };

      const result = service.auditListing(listing);

      const fewImagesIssue = result.issues.find(
        (i) => i.type === 'few_images',
      );
      expect(fewImagesIssue).toBeDefined();
    });

    it('should detect missing alt text', () => {
      const listing = {
        title: 'Test Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
        images: [{ fullUrl: 'test.jpg' }],
      };

      const result = service.auditListing(listing);

      const altTextIssue = result.issues.find(
        (i) => i.type === 'missing_alt_text',
      );
      expect(altTextIssue).toBeDefined();
    });

    it('should detect missing price', () => {
      const listing = {
        title: 'Test Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
      };

      const result = service.auditListing(listing);

      const priceIssue = result.issues.find((i) => i.type === 'missing_price');
      expect(priceIssue).toBeDefined();
    });

    it('should handle low quality images', () => {
      const listing = {
        title: 'Test Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
        price: 100,
        images: [
          { fullUrl: 'test1.jpg', qualityScore: 30 },
          { fullUrl: 'test2.jpg', qualityScore: 40 },
        ],
      };

      const result = service.auditListing(listing);

      expect(
        result.recommendations.some((r) =>
          r.toLowerCase().includes('quality'),
        ),
      ).toBe(true);
    });
  });

  describe('getScoreColor', () => {
    it('should return green for high scores', () => {
      expect(service.getScoreColor(85)).toBe('green');
      expect(service.getScoreColor(100)).toBe('green');
    });

    it('should return yellow for medium-high scores', () => {
      expect(service.getScoreColor(70)).toBe('yellow');
    });

    it('should return orange for medium scores', () => {
      expect(service.getScoreColor(50)).toBe('orange');
    });

    it('should return red for low scores', () => {
      expect(service.getScoreColor(30)).toBe('red');
      expect(service.getScoreColor(0)).toBe('red');
    });
  });

  describe('getScoringTips', () => {
    it('should return scoring tips', () => {
      const tips = service.getScoringTips();

      expect(tips.length).toBeGreaterThan(0);
      expect(tips[0].title).toBeDefined();
      expect(tips[0].description).toBeDefined();
    });
  });
});
