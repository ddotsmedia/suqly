interface PriceDisplayProps {
  amount: number;
  currency?: 'AED' | 'USD';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceDisplay({
  amount,
  currency = 'AED',
  size = 'md',
  className = '',
}: PriceDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span className={`${sizes[size]} font-bold text-blue-600 ${className}`}>
      {currency} {formatted}
    </span>
  );
}
