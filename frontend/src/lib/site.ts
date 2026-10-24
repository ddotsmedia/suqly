export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://suqly.com').replace(/\/$/, '');
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Values must match the backend enums in backend/src/listings/listing.entity.ts.
export const CATEGORIES = [
  { slug: 'goods', name: 'Goods', description: 'Items to buy and sell, from electronics to household goods.' },
  { slug: 'property', name: 'Property', description: 'Properties listed for sale or rent across the UAE.' },
  { slug: 'motors', name: 'Motors', description: 'Cars, bikes and vehicle listings.' },
  { slug: 'jobs', name: 'Jobs', description: 'Job listings from employers and recruiters.' },
  { slug: 'services', name: 'Services', description: 'Services offered by local providers.' },
  { slug: 'businesses', name: 'Businesses', description: 'Businesses for sale or partnership.' },
] as const;

export const EMIRATES = [
  { slug: 'dubai', name: 'Dubai' },
  { slug: 'abudhabi', name: 'Abu Dhabi' },
  { slug: 'sharjah', name: 'Sharjah' },
  { slug: 'ajman', name: 'Ajman' },
  { slug: 'umm_al_quwain', name: 'Umm Al Quwain' },
  { slug: 'ras_al_khaimah', name: 'Ras Al Khaimah' },
  { slug: 'fujairah', name: 'Fujairah' },
  { slug: 'al_ain', name: 'Al Ain' },
] as const;

// Dubai areas. `name` must match the community value listings are saved with.
export const DUBAI_COMMUNITIES = [
  { slug: 'dubai-marina', name: 'Dubai Marina' },
  { slug: 'downtown-dubai', name: 'Downtown Dubai' },
  { slug: 'business-bay', name: 'Business Bay' },
  { slug: 'jumeirah-village-circle', name: 'Jumeirah Village Circle' },
  { slug: 'dubai-hills-estate', name: 'Dubai Hills Estate' },
  { slug: 'al-barsha', name: 'Al Barsha' },
  { slug: 'jumeirah', name: 'Jumeirah' },
  { slug: 'deira', name: 'Deira' },
  { slug: 'al-quoz', name: 'Al Quoz' },
  { slug: 'dubai-silicon-oasis', name: 'Dubai Silicon Oasis' },
] as const;

export function findDubaiCommunity(slug: string) {
  return DUBAI_COMMUNITIES.find((c) => c.slug === slug);
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function findEmirate(slug: string) {
  return EMIRATES.find((e) => e.slug === slug);
}

export interface ListingSummary {
  id: number;
  title: string;
  price: number | null;
  currency?: string;
  category?: string;
  emirate?: string;
  community?: string;
  updatedAt?: string;
  images?: { thumbnailUrl?: string; fullUrl?: string; imageUrl?: string }[];
}

// The API may wrap the paginated body in { success, data }. Read both shapes.
export function readListingsBody(json: any): { items: ListingSummary[]; pages: number } {
  const body = json?.data && !Array.isArray(json.data) ? json.data : json ?? {};
  return {
    items: Array.isArray(body?.data) ? body.data : [],
    pages: Number(body?.pages) || 1,
  };
}

export function primaryImage(listing: ListingSummary): string | null {
  const img = listing.images?.[0];
  return img?.thumbnailUrl || img?.fullUrl || img?.imageUrl || null;
}

// Used by the sitemap. Returns [] if the API is unreachable so the build still succeeds.
export async function fetchAllListings(): Promise<ListingSummary[]> {
  const pageSize = 100;
  const all: ListingSummary[] = [];
  try {
    for (let page = 1; page <= 500; page++) {
      const res = await fetch(`${API_URL}/listings?page=${page}&limit=${pageSize}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const { items, pages } = readListingsBody(await res.json());
      all.push(...items);
      if (page >= pages || items.length === 0) break;
    }
  } catch {
    return all;
  }
  return all;
}

// Used by category and emirate pages.
export async function fetchListingsFiltered(
  filters: { category?: string; subcategory?: string; emirate?: string; community?: string },
  limit = 24,
): Promise<ListingSummary[]> {
  const params = new URLSearchParams({ page: '1', limit: String(limit) });
  if (filters.category) params.set('category', filters.category);
  if (filters.subcategory) params.set('subcategory', filters.subcategory);
  if (filters.emirate) params.set('emirate', filters.emirate);
  if (filters.community) params.set('community', filters.community);
  try {
    const res = await fetch(`${API_URL}/listings?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return readListingsBody(await res.json()).items;
  } catch {
    return [];
  }
}
