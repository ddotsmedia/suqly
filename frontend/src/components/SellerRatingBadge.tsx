'use client';

import { useEffect, useState } from 'react';

export function SellerRatingBadge({ sellerId }: { sellerId: number }) {
  const [stats, setStats] = useState<{ avgRating: number; totalReviews: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reviews/sellers/${sellerId}/stats`
        );
        const data = await res.json();
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch seller stats:', err);
      }
    };

    fetchStats();
  }, [sellerId]);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full inline-block">
      <span className="text-yellow-400">★</span>
      <span className="font-medium">{stats.avgRating.toFixed(1)}</span>
      <span className="text-sm text-gray-600">({stats.totalReviews} reviews)</span>
    </div>
  );
}
