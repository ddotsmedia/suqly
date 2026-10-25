export interface RecentListing {
  id: number;
  title: string;
  price: number | null;
  currency: string;
  category: string;
}

const KEY = 'suqly_recently_viewed';
const MAX = 8;

// Per-browser convenience only; storage may be blocked or unavailable.
export function recordRecentlyViewed(listing: RecentListing) {
  try {
    const current = readRecentlyViewed().filter((l) => l.id !== listing.id);
    const next = [
      { id: listing.id, title: listing.title, price: listing.price, currency: listing.currency, category: listing.category },
      ...current,
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function readRecentlyViewed(): RecentListing[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
