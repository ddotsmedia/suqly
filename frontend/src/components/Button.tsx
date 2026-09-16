interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:bg-blue-300 disabled:shadow-none',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-soft active:scale-95 disabled:bg-gray-50',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:scale-95 disabled:bg-green-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:scale-95 disabled:bg-red-300',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 active:scale-95 disabled:opacity-50',
    outline: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 active:scale-95 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${variants[variant]} ${sizes[size]} rounded-md font-semibold transition-all duration-200 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin">⏳</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
