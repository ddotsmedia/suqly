import { absoluteUrl } from './site';

// Keywords used across every page. Google ignores the meta keywords tag, so these
// mainly guide our own copy; titles and descriptions carry the search value.
export const BASE_KEYWORDS = [
  'UAE marketplace',
  'buy and sell UAE',
  'classifieds UAE',
  'free classifieds Dubai',
  'Dubai classifieds',
  'Abu Dhabi classifieds',
  'Sharjah classifieds',
  'used items UAE',
  'sell items UAE',
  'verified local listings UAE',
  'online marketplace Dubai',
  'Suqly',
];

export function keywordsFor(...extra: string[]): string[] {
  return Array.from(new Set([...extra, ...BASE_KEYWORDS]));
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
