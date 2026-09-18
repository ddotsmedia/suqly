'use client';

import { useState } from 'react';
import { Copy, Twitter, Facebook, X } from 'lucide-react';

interface WishlistShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl?: string;
  shareToken?: string;
  onDelete?: () => Promise<void>;
}

export function WishlistShareModal({
  isOpen,
  onClose,
  shareUrl,
  shareToken,
  onDelete,
}: WishlistShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        setIsDeleting(true);
        await onDelete();
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out my wishlist on Suqly! ${shareUrl}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || '')}`,
      '_blank',
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share Your Wishlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {shareUrl && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-green-600">{copied && '✓ Copied!'}</div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Share on social media:</p>
              <div className="flex gap-2">
                <button
                  onClick={shareOnTwitter}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? 'Removing...' : 'Remove Share Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
