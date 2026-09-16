'use client';

interface PriceTagProps {
  price: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceTag({
  price,
  currency = 'AED',
  size = 'md',
  className = '',
}: PriceTagProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold',
  };

  return (
    <div className={`text-blue-600 ${sizeClasses[size]} ${className}`}>
      <span className="text-sm font-semibold">{currency}</span>
      {' '}
      <span>{price.toLocaleString('en-US')}</span>
    </div>
  );
}
