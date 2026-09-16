'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface FeatureFlag {
  id: number;
  flag_name: string;
  description: string;
  enabled: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

interface FlagsByCategory {
  payments: FeatureFlag[];
  seller: FeatureFlag[];
  buyer: FeatureFlag[];
  admin: FeatureFlag[];
  total_enabled: number;
  total_flags: number;
  last_updated: string;
}

export default function FeatureFlagsPanel() {
  const [flags, setFlags] = useState<FlagsByCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingFlag, setTogglingFlag] = useState<string | null>(null);
  const [togglingCategory, setTogglingCategory] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/feature-flags`);
      if (!res.ok) throw new Error('Failed to fetch flags');
      const data = await res.json();
      setFlags(data);
    } catch (error) {
      console.error('Error fetching flags:', error);
      setMessage({ type: 'error', text: 'Failed to load feature flags' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagName: string, newState: boolean) => {
    try {
      setTogglingFlag(flagName);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/settings/feature-flags/${flagName}/toggle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: newState }),
        },
      );

      if (!res.ok) throw new Error('Failed to toggle flag');

      setMessage({
        type: 'success',
        text: `${flagName} ${newState ? 'enabled' : 'disabled'}`,
      });

      // Refresh flags
      await fetchFlags();
    } catch (error) {
      console.error('Error toggling flag:', error);
      setMessage({ type: 'error', text: 'Failed to toggle feature' });
    } finally {
      setTogglingFlag(null);
    }
  };

  const batchToggleCategory = async (category: string, enable: boolean) => {
    try {
      setTogglingCategory(category);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/settings/feature-flags/batch-toggle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, enabled: enable }),
        },
      );

      if (!res.ok) throw new Error('Failed to batch toggle');

      setMessage({
        type: 'success',
        text: `All ${category} features ${enable ? 'enabled' : 'disabled'}`,
      });

      // Refresh flags
      await fetchFlags();
    } catch (error) {
      console.error('Error batch toggling:', error);
      setMessage({ type: 'error', text: 'Failed to update category' });
    } finally {
      setTogglingCategory(null);
    }
  };

  const renderCategory = (
    title: string,
    icon: string,
    categoryKey: keyof Omit<FlagsByCategory, 'total_enabled' | 'total_flags' | 'last_updated'>,
    categoryFlags: FeatureFlag[],
  ) => (
    <div key={categoryKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">
                {categoryFlags.filter((f) => f.enabled).length} / {categoryFlags.length} enabled
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => batchToggleCategory(categoryKey, true)}
              disabled={togglingCategory === categoryKey || loading}
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => batchToggleCategory(categoryKey, false)}
              disabled={togglingCategory === categoryKey || loading}
              className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {categoryFlags.map((flag) => (
          <div
            key={flag.id}
            className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <code className="text-sm font-mono font-bold text-gray-900">
                  {flag.flag_name}
                </code>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    flag.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {flag.enabled ? '✓ ENABLED' : '✗ DISABLED'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{flag.description}</p>
            </div>

            <button
              onClick={() => toggleFlag(flag.flag_name, !flag.enabled)}
              disabled={togglingFlag === flag.flag_name || loading}
              className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                flag.enabled
                  ? 'bg-green-100 hover:bg-green-200 text-green-800'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {togglingFlag === flag.flag_name ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : flag.enabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Disabled
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!flags) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load feature flags</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Flags</h1>
        <p className="text-gray-600 text-lg">
          Control which features are available to users. Changes take effect immediately.
        </p>
      </div>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🚀</div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Active Features</p>
            <p className="text-2xl font-bold text-blue-900">
              {flags.total_enabled} / {flags.total_flags}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-blue-800">
              Payments Disabled (Free Tier)
            </p>
            <p className="text-xs text-blue-700">
              Last updated: {new Date(flags.last_updated).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-8">
        {renderCategory('💳 Payment Features', 'payments', flags.payments)}
        {renderCategory('🏪 Seller Features', 'seller', flags.seller)}
        {renderCategory('👤 Buyer Features', 'buyer', flags.buyer)}
        {renderCategory('⚙️ Admin Features', 'admin', flags.admin)}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-900 mb-1">Free Tier Strategy</h3>
            <p className="text-sm text-yellow-800 mb-3">
              Payment features are disabled by default. When you reach 10K+ users and
              want to monetize, enable payment features here to unlock commission and
              payout systems.
            </p>
            <details className="text-sm text-yellow-800">
              <summary className="font-semibold cursor-pointer mb-2">
                What happens when I enable payments?
              </summary>
              <ul className="list-disc pl-5 space-y-1">
                <li>Stripe payment processing becomes available</li>
                <li>Commission tracking is enabled</li>
                <li>Seller payouts and settlements start</li>
                <li>Premium subscription tiers unlock</li>
                <li>Buyers see payment options in checkout</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
