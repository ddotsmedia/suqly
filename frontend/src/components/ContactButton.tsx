'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { getContactLink } from '@/lib/api';

type ContactMethod = 'whatsapp' | 'telegram';

interface ContactButtonProps {
  listingId: number;
  method: ContactMethod;
  sellerName: string;
  listingTitle: string;
  listingPrice: number;
  className?: string;
}

export function ContactButton({
  listingId,
  method,
  sellerName,
  listingTitle,
  listingPrice,
  className = '',
}: ContactButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getContactLink(listingId, method);

      if (response.url) {
        window.open(response.url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open contact');
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = method === 'whatsapp' ? MessageCircle : Send;
  const label = method === 'whatsapp' ? 'WhatsApp' : 'Telegram';
  const bgColor = method === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${bgColor} ${className}`}
      aria-label={`Contact via ${label}`}
    >
      <Icon className="w-5 h-5" />
      {isLoading ? 'Opening...' : `Chat on ${label}`}
    </button>
  );
}
