'use client';

import { useState } from 'react';
import { useAddToWishlist, useIsInWishlist } from '@/hooks/useWishlist';
import { Heart } from 'lucide-react';

interface AddToWishlistButtonProps {
  listingId: number;
  onSuccess?: () => void;
}

export function AddToWishlistButton({
  listingId,
  onSuccess,
}: AddToWishlistButtonProps) {
  const isInWishlist = useIsInWishlist(listingId);
  const { add, isSaving } = useAddToWishlist(listingId);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleClick = async () => {
    try {
      await add();
      setToastMessage('✓ Added to wishlist');
      setShowToast(true);
      onSuccess?.();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setToastMessage('Failed to add to wishlist');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
        {isSaving ? 'Adding...' : isInWishlist ? 'Saved' : 'Save'}
      </button>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </>
  );
}
