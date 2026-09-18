import { Test, TestingModule } from '@nestjs/testing';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeoService],
    }).compile();

    service = module.get<SeoService>(SeoService);
  });

  describe('generateMetaTags', () => {
    it('should generate meta tags for listing', () => {
      const listing = {
        id: 1,
        title: 'iPhone 15 Pro Max',
        description: 'Brand new iPhone 15 Pro Max in excellent condition',
        category: 'electronics',
        emirate: 'dubai',
        images: [{ fullUrl: 'https://example.com/image.jpg' }],
      };

      const tags = service.generateMetaTags(listing);

      expect(tags.title).toContain('iPhone 15 Pro Max');
      expect(tags.description).toContain('iPhone');
      expect(tags.keywords).toContain('electronics');
      expect(tags.og_image).toBeDefined();
      expect(tags.canonical_url).toContain('/listings/1');
    });

    it('should handle listings without images', () => {
      const listing = {
        id: 1,
        title: 'Test Item',
        description: 'Test description',
        category: 'goods',
        emirate: 'dubai',
        images: [],
      };

      const tags = service.generateMetaTags(listing);

      expect(tags.og_image).toBe('/default-listing.jpg');
    });

    it('should truncate long descriptions', () => {
      const listing = {
        id: 1,
        title: 'Test',
        description: 'A'.repeat(200),
        category: 'goods',
        emirate: 'dubai',
      };

      const tags = service.generateMetaTags(listing);

      expect(tags.description.length).toBeLessThanOrEqual(160);
    });
  });

  describe('generateStructuredData', () => {
    it('should generate schema.org structured data', () => {
      const listing = {
        id: 1,
        title: 'iPhone 15 Pro Max',
        description: 'Brand new',
        price: 5000,
        images: [{ fullUrl: 'https://example.com/image.jpg' }],
        user: { displayName: 'John Seller' },
        reviews: [],
      };

      const schema = service.generateStructuredData(listing);

      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('iPhone 15 Pro Max');
      expect(schema.offers.price).toBe(5000);
      expect(schema.offers.priceCurrency).toBe('AED');
    });

    it('should include seller information', () => {
      const listing = {
        id: 1,
        title: 'Test',
        description: 'Test',
        price: 100,
        user: { displayName: 'Seller Name' },
      };

      const schema = service.generateStructuredData(listing);

      expect(schema.seller.name).toBe('Seller Name');
    });
  });

  describe('generateSitemap', () => {
    it('should generate XML sitemap', () => {
      const listings = [
        { id: 1, title: 'Item 1', updatedAt: new Date() },
        { id: 2, title: 'Item 2', updatedAt: new Date() },
      ];

      const sitemap = service.generateSitemap(listings, 'xml');

      expect(sitemap).toContain('<?xml version="1.0"');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('listings/1');
      expect(sitemap).toContain('listings/2');
      expect(sitemap).toContain('</urlset>');
    });

    it('should include static pages in sitemap', () => {
      const listings: any[] = [];
      const sitemap = service.generateSitemap(listings, 'xml');

      expect(sitemap).toContain('https://suqly.ae/');
      expect(sitemap).toContain('https://suqly.ae/categories');
      expect(sitemap).toContain('https://suqly.ae/search');
    });

    it('should generate JSON sitemap format', () => {
      const listings = [{ id: 1, title: 'Item 1', updatedAt: new Date() }];

      const sitemap = service.generateSitemap(listings, 'json');
      const parsed = JSON.parse(sitemap);

      expect(parsed.urlset).toBeDefined();
      expect(parsed.urlset.length).toBe(1);
      expect(parsed.urlset[0].loc).toContain('listings/1');
    });
  });

  describe('generateRobotsTxt', () => {
    it('should generate robots.txt', () => {
      const robotsTxt = service.generateRobotsTxt();

      expect(robotsTxt).toContain('User-agent: *');
      expect(robotsTxt).toContain('Allow: /listings');
      expect(robotsTxt).toContain('Disallow: /admin/');
      expect(robotsTxt).toContain('Sitemap:');
    });

    it('should include search engine specific rules', () => {
      const robotsTxt = service.generateRobotsTxt();

      expect(robotsTxt).toContain('User-agent: Googlebot');
      expect(robotsTxt).toContain('User-agent: Bingbot');
    });
  });

  describe('canonicalUrl', () => {
    it('should generate canonical URL', () => {
      const listing = { id: 123 };
      const url = service.canonicalUrl(listing);

      expect(url).toBe('https://suqly.ae/listings/123');
    });
  });

  describe('generateHreflangTags', () => {
    it('should generate hreflang tags for EN and AR', () => {
      const tags = service.generateHreflangTags(1);

      expect(tags.length).toBe(3);
      expect(tags.find((t) => t.hreflang === 'en-AE')).toBeDefined();
      expect(tags.find((t) => t.hreflang === 'ar-AE')).toBeDefined();
      expect(tags.find((t) => t.hreflang === 'x-default')).toBeDefined();
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate breadcrumb structured data', () => {
      const items = [
        { name: 'Home', url: 'https://suqly.ae' },
        { name: 'Electronics', url: 'https://suqly.ae/categories/electronics' },
        { name: 'Phones', url: 'https://suqly.ae/categories/electronics/phones' },
      ];

      const schema = service.generateBreadcrumbSchema(items);

      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement.length).toBe(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[2].position).toBe(3);
    });
  });
});
