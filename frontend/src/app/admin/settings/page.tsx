import { Metadata } from 'next';
import FeatureFlagsPanel from '@/components/admin/FeatureFlagsPanel';

export const metadata: Metadata = {
  title: 'Admin Settings - Suqly',
  description: 'Admin panel for managing feature flags and settings',
};

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <FeatureFlagsPanel />
      </div>
    </div>
  );
}
