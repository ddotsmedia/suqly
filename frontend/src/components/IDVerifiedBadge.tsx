import { Shield } from 'lucide-react';

export function IDVerifiedBadge() {
  return (
    <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
      <Shield className="w-3.5 h-3.5 text-blue-600" />
      <span className="text-xs font-medium text-blue-700">ID Verified</span>
    </div>
  );
}
