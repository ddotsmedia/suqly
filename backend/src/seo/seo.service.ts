import { Injectable } from '@nestjs/common';

interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  og_image?: string;
  og_url?: string;
  twitter_card: string;
  canonical_url: string;
  locale: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image?: string;
  price?: number;
  priceCurrency?: string;
  url?: string;
  [key: string]: any;
}

@Injectable()
export class SeoService {
  generateMetaTags(listing: any): MetaTags {
    const title = `${listing.title} - Suqly UAE Marketplace`;
    const description = listing.description
      ?.substring(0, 160) || `Buy ${listing.title} on Suqly UAE Marketplace`;
    const keywords = `${listing.category}, ${listing.emirate}, ${listing.title}, UAE`;

    return {
      title,
      description,
      keywords,
      og_image: listing.images?.[0]?.fullUrl || '/default-listing.jpg',
      og_url: `https://suqly.ae/listings/${listing.id}`,
      twitter_card: 'summary_large_image',
      canonical_url: `https://suqly.ae/listings/${listing.id}`,
      locale: 'en_AE',
    };
  }

  generateStructuredData(listing: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images?.[0]?.fullUrl,
      offers: {
        '@type': 'Offer',
        price: listing.price,
        priceCurrency: 'AED',
        availability: 'https://schema.org/InStock',
        url: `https://suqly.ae/listings/${listing.id}`,
      },
      seller: {
        '@type': 'Organization',
        name: listing.user?.displayName || 'Suqly Seller',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: listing.reviews?.length || 0,
      },
    };
  }

  generateSitemap(listings: any[], format: 'xml' | 'json' = 'xml'): string {
    if (format === 'xml') {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Add static pages
      xml += this.createSitemapEntry('https://suqly.ae/', 'weekly', '1.0');
      xml += this.createSitemapEntry('https://suqly.ae/categories', 'weekly', '0.8');
      xml += this.createSitemapEntry('https://suqly.ae/search', 'daily', '0.7');

      // Add listings
      for (const listing of listings) {
        xml += this.createSitemapEntry(
          `https://suqly.ae/listings/${listing.id}`,
          'daily',
          '0.9',
          listing.updatedAt,
        );
      }

      xml += '</urlset>';
      return xml;
    }

    // JSON format
    return JSON.stringify({
      urlset: listings.map((listing) => ({
        loc: `https://suqly.ae/listings/${listing.id}`,
        lastmod: listing.updatedAt?.toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      })),
    });
  }

  private createSitemapEntry(
    url: string,
    changefreq: string,
    priority: string,
    lastmod?: Date,
  ): string {
    let entry = '  <url>\n';
    entry += `    <loc>${url}</loc>\n`;
    if (lastmod) {
      entry += `    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>\n`;
    }
    entry += `    <changefreq>${changefreq}</changefreq>\n`;
    entry += `    <priority>${priority}</priority>\n`;
    entry += '  </url>\n';
    return entry;
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Allow: /listings
Allow: /categories
Allow: /sellers
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /profile/
Disallow: /search?*
Disallow: /seller/dashboard

Sitemap: https://suqly.ae/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Yandexbot
Disallow: /admin/
Allow: /

# Crawl delay (milliseconds)
Crawl-delay: 1`;
  }

  canonicalUrl(listing: any): string {
    return `https://suqly.ae/listings/${listing.id}`;
  }

  generateHreflangTags(
    listingId: number,
  ): Array<{ rel: string; hreflang: string; href: string }> {
    return [
      {
        rel: 'alternate',
        hreflang: 'en-AE',
        href: `https://suqly.ae/listings/${listingId}?lang=en`,
      },
      {
        rel: 'alternate',
        hreflang: 'ar-AE',
        href: `https://suqly.ae/listings/${listingId}?lang=ar`,
      },
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: `https://suqly.ae/listings/${listingId}`,
      },
    ];
  }

  generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>,
  ): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }
}
