import { Check } from 'lucide-react';

export function PhoneVerifiedBadge() {
  return (
    <div className="flex items-center gap-1 bg-green-50 px-2.5 py-0.5 rounded-full inline-block">
      <Check className="w-3.5 h-3.5 text-green-600" />
      <span className="text-xs font-medium text-green-700">Phone Verified</span>
    </div>
  );
}
