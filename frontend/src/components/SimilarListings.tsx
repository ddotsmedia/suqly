'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Similar = {
  id: number;
  title: string;
  price: number | string;
  emirate?: string;
  images?: { imageUrl: string }[];
};

export default function SimilarListings({
  listingId,
  category,
  emirate,
}: {
  listingId: number;
  category?: string;
  emirate?: string;
}) {
  const [items, setItems] = useState<Similar[]>([]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    const params = new URLSearchParams({ category, limit: '8' });
    if (emirate) params.set('emirate', emirate);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled || !body?.data) return;
        const others = (body.data as Similar[]).filter((l) => l.id !== listingId).slice(0, 4);
        setItems(others);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listingId, category, emirate]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="similar-heading" className="mt-12">
      <h2 id="similar-heading" className="text-xl font-bold mb-4">Similar listings</h2>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/listings/${item.id}`} className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md">
              {item.images?.[0]?.imageUrl ? (
                <img src={item.images[0].imageUrl} alt="" loading="lazy" className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gray-100" />
              )}
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 line-clamp-2">{item.title}</p>
                <p className="text-green-600 font-bold text-sm mt-1">AED {item.price}</p>
                {item.emirate && <p className="text-xs text-gray-500 mt-1">{item.emirate}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
