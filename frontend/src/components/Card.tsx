interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'flat';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const variants = {
    default: 'bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-md transition-shadow duration-200',
    hover: 'bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-hover hover:border-blue-300 transition-all duration-200 cursor-pointer',
    flat: 'bg-gray-50 rounded-xl border border-gray-100',
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  };

  return (
    <div className={`${variants[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
