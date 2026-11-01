'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { findCategory } from '@/lib/site';

type FeaturedRecord = {
  id: number;
  listing?: {
    id: number;
    title: string;
    price: number | string;
    category?: string;
    emirate?: string;
    images?: { imageUrl: string }[];
  } | null;
};

export default function FeaturedListings() {
  const [items, setItems] = useState<FeaturedRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/featured?limit=6`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setItems(data.filter((f) => f.listing));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Listings</h2>
            <p className="text-gray-600">Most popular items right now</p>
          </div>
          <Link href="/listings" className="text-blue-600 hover:text-blue-700 font-bold text-lg">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f) => {
            const l = f.listing!;
            const cat = l.category ? findCategory(l.category)?.name ?? l.category : null;
            const image = l.images?.[0]?.imageUrl;
            return (
              <Link
                key={f.id}
                href={`/listings/${l.id}`}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-card hover:shadow-hover hover:border-blue-300 transition-all duration-300"
              >
                <div className="relative bg-gray-100 h-56 overflow-hidden">
                  {image ? (
                    <img src={image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
                  )}
                  {cat && (
                    <span className="absolute top-3 left-3 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                      {cat}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {l.title}
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    AED {Number(l.price).toLocaleString('en-US')}
                  </div>
                  {l.emirate && <p className="text-sm text-gray-500">{l.emirate}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
