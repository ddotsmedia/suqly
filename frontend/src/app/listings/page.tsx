'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getListings } from '@/lib/api';

interface Listing {
  id: number;
  title: string;
  price: number | null;
  currency: string;
  category: string;
  emirate?: string;
  community?: string;
}

const PAGE_SIZE = 20;

// The API may wrap the paginated body in { success, data }. Read both shapes.
function readPage(res: any): { items: Listing[]; pages: number } {
  const body = res?.data ?? res ?? {};
  return {
    items: Array.isArray(body.data) ? body.data : [],
    pages: Number(body.pages) || 1,
  };
}

function formatPrice(price: number | null, currency: string) {
  if (price === null || price === undefined) return 'Price on request';
  return `${currency} ${Number(price).toLocaleString('en-US')}`;
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsContent />
    </Suspense>
  );
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [pages, setPages] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getListings(page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        const parsed = readPage(res);
        setListings(parsed.items);
        setPages(parsed.pages);
      })
      .catch(() => {
        if (!cancelled) setError('Listings could not be loaded. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, attempt]);

  const categories = useMemo(
    () => Array.from(new Set(listings.map((l) => l.category).filter(Boolean))).sort(),
    [listings]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = listings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!q) return true;
      return [l.title, l.category, l.community, l.emirate]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
    if (sort === 'price-asc') items = [...items].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'price-desc') items = [...items].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    return items;
  }, [listings, query, category, sort]);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Browse Listings</h1>
          <p className="text-blue-100">Find items from verified sellers across the UAE</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this page by title, category or area"
            aria-label="Search listings"
            className="md:col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort listings"
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {loading && <p className="text-gray-600 py-12 text-center">Loading listings…</p>}

        {!loading && error && (
          <div role="alert" className="py-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="px-6 py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="text-gray-600 py-12 text-center">No listings match your filters.</p>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
              >
                <p className="text-sm text-blue-600 font-medium mb-2">{listing.category}</p>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600">{listing.title}</h2>
                <p className="text-xl font-bold text-gray-900 mb-2">{formatPrice(listing.price, listing.currency || 'AED')}</p>
                {(listing.community || listing.emirate) && (
                  <p className="text-sm text-gray-600">{[listing.community, listing.emirate].filter(Boolean).join(', ')}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-gray-700">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
