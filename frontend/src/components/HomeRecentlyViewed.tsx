'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readRecentlyViewed, RecentListing } from '@/lib/recent';

// Reads the browser-only list after mount, so server and client markup match.
export default function HomeRecentlyViewed() {
  const [items, setItems] = useState<RecentListing[]>([]);

  useEffect(() => {
    setItems(readRecentlyViewed().slice(0, 4));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently viewed</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/listings/${item.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-600"
              >
                <p className="font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                {item.price != null && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.currency} {Number(item.price).toLocaleString()}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
