import type { MetadataRoute } from 'next';
import { absoluteUrl, CATEGORIES, EMIRATES, fetchAllListings } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...['/listings', '/sell', '/pricing', '/faq', '/help', '/safety'].map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: absoluteUrl(`/categories/${c.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const emiratePages: MetadataRoute.Sitemap = EMIRATES.map((e) => ({
    url: absoluteUrl(`/emirates/${e.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const listings = await fetchAllListings();
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: absoluteUrl(`/listings/${l.id}`),
    lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...emiratePages, ...listingPages];
}
