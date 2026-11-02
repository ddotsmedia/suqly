'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/site';

// Shows how often a seller replies to buyer messages. Hidden when there is no data yet.
export function SellerResponseBadge({ sellerId }: { sellerId: number }) {
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/users/${sellerId}/stats`)
      .then((res) => res.json())
      .then((json) => {
        const value = json?.data?.responseRate;
        if (!cancelled && typeof value === 'number') setRate(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  if (rate === null) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-800">
      Replies to {Math.round(rate)}% of messages
    </span>
  );
}
