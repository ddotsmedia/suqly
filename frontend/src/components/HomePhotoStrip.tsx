'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getListings } from '@/lib/api';
import { primaryImage, readListingsBody, ListingSummary } from '@/lib/site';

interface Photo {
  id: number;
  title: string;
  src: string;
}

// Shows real listing photos under the hero. Stays hidden unless at least three
// listings have photos, so the home page never shows placeholder images.
export default function HomePhotoStrip() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    let cancelled = false;
    getListings(1, 12)
      .then((json: unknown) => {
        const { items } = readListingsBody(json);
        const found = items
          .map((l: ListingSummary) => ({ id: l.id, title: l.title, src: primaryImage(l) }))
          .filter((p): p is Photo => Boolean(p.src))
          .slice(0, 8);
        if (!cancelled) setPhotos(found);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (photos.length < 3) return null;

  return (
    <section className="py-12 px-4 bg-white" aria-labelledby="fresh-heading">
      <div className="max-w-6xl mx-auto">
        <h2 id="fresh-heading" className="text-2xl font-bold text-gray-900 mb-6">
          Fresh on Suqly
        </h2>
        <div className="flex gap-4 overflow-x-auto snap-x pb-2">
          {photos.map((p) => (
            <Link
              key={p.id}
              href={`/listings/${p.id}`}
              className="snap-start shrink-0 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-hover transition-shadow"
            >
              <img src={p.src} alt={p.title} loading="lazy" className="h-40 w-full object-cover" />
              <div className="p-3 text-sm font-medium text-gray-900 truncate">{p.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
