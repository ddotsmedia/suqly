interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}

export default function UserAvatar({
  src = '',
  alt = 'User',
  size = 'md',
  fallback = 'U',
  className = '',
}: UserAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold bg-blue-200 text-blue-800 overflow-hidden ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback.substring(0, 2).toUpperCase()
      )}
    </div>
  );
}
