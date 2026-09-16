interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Input({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  disabled = false,
  label = '',
  required = false,
  className = '',
  size = 'md',
}: InputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block font-semibold text-gray-700 mb-2.5 text-sm">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border-2 rounded-md transition-all duration-200 focus:outline-none ${
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      />
      {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
    </div>
  );
}
