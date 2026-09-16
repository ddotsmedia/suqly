'use client';

interface VerifiedBadgeProps {
  verified?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function VerifiedBadge({
  verified = true,
  size = 'sm',
  className = '',
}: VerifiedBadgeProps) {
  if (!verified) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-full text-green-700 font-semibold inline-flex items-center gap-1 ${sizeClasses[size]} ${className}`}
    >
      <span>✓</span>
      <span>Verified</span>
    </div>
  );
}
