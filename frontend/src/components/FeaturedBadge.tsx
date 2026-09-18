'use client';

import { Star } from 'lucide-react';

interface FeaturedBadgeProps {
  tier: 'free' | 'premium';
  daysRemaining: number;
}

export function FeaturedBadge({ tier, daysRemaining }: FeaturedBadgeProps) {
  const bgColor = tier === 'premium' ? 'bg-yellow-500' : 'bg-blue-500';
  const textColor = 'text-white';

  return (
    <div
      className={`absolute top-2 right-2 flex items-center gap-1 ${bgColor} ${textColor} px-2 py-1 rounded-md text-xs font-semibold z-10 shadow-lg`}
    >
      <Star className="w-3 h-3 fill-current" />
      <span>Featured</span>
      {daysRemaining > 0 && <span className="ml-1">({daysRemaining}d)</span>}
    </div>
  );
}
