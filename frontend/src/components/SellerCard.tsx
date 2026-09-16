'use client';

import UserAvatar from './UserAvatar';

interface SellerCardProps {
  name: string;
  rating?: number;
  responseTime?: string;
  verified?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function SellerCard({
  name,
  rating = 4.5,
  responseTime = '2 hours',
  verified = true,
  onClick,
  className = '',
}: SellerCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-card p-4 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar fallback={name.substring(0, 2)} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {verified && (
            <p className="text-xs text-green-600 font-medium">✓ Verified</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-semibold text-gray-900">{rating}</span>
            <span className="text-xs text-gray-500">({Math.round(rating * 10)} reviews)</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Replies in {responseTime}
          </p>
        </div>
      </div>
    </div>
  );
}
