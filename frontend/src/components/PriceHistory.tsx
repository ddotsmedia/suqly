'use client';

import { useEffect, useState } from 'react';

type Change = { id: number; price: number | string; currency?: string; changedAt: string };

export default function PriceHistory({ listingId }: { listingId: number }) {
  const [changes, setChanges] = useState<Change[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/price-history`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled && Array.isArray(body?.data)) setChanges(body.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (changes.length === 0) return null;

  // API returns newest first; show oldest first
  const ordered = [...changes].reverse();

  return (
    <section aria-labelledby="price-history-heading" className="mb-6">
      <h3 id="price-history-heading" className="font-semibold mb-2">Price history</h3>
      <ul className="text-sm text-gray-700 space-y-1">
        {ordered.map((c) => (
          <li key={c.id} className="flex justify-between max-w-xs">
            <span>{new Date(c.changedAt).toLocaleDateString('en-GB')}</span>
            <span className="font-medium">{c.currency || 'AED'} {Number(c.price).toLocaleString('en-US')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
