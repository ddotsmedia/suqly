'use client';

import { ContactButton } from './ContactButton';

interface ContactButtonsGroupProps {
  listingId: number;
  availableMethods: {
    whatsapp?: boolean;
    telegram?: boolean;
  };
  maskedPhone?: string;
  compact?: boolean;
}

export function ContactButtonsGroup({
  listingId,
  availableMethods,
  maskedPhone,
  compact = false,
}: ContactButtonsGroupProps) {
  const methods: ('whatsapp' | 'telegram')[] = [];

  if (availableMethods.whatsapp) methods.push('whatsapp');
  if (availableMethods.telegram) methods.push('telegram');

  if (methods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-medium">Connect via your preferred method</p>

      <div className={`flex ${compact ? 'gap-2' : 'gap-3'} ${methods.length > 1 && !compact ? 'flex-col sm:flex-row' : 'flex-row'}`}>
        {methods.map((method) => (
          <ContactButton
            key={method}
            listingId={listingId}
            method={method}
            className={`flex-1 ${compact ? 'px-3 py-1 text-sm' : 'px-4 py-2'}`}
          />
        ))}
      </div>

      {maskedPhone && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Phone: {maskedPhone}</span>
          <button
            onClick={() => navigator.clipboard.writeText(maskedPhone)}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
