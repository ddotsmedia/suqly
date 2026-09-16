// Client-side feature flags utility for checking if features are enabled
// Used in components to conditionally render payment-related UI

class FeatureFlagsClient {
  private static instance: FeatureFlagsClient;
  private flags = new Map<string, boolean>();
  private lastUpdate = 0;
  private CACHE_TTL = 60000; // 60 seconds

  private constructor() {}

  static getInstance(): FeatureFlagsClient {
    if (!FeatureFlagsClient.instance) {
      FeatureFlagsClient.instance = new FeatureFlagsClient();
    }
    return FeatureFlagsClient.instance;
  }

  async loadFlags(): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/settings/feature-flags`,
      );
      if (!response.ok) throw new Error('Failed to load feature flags');

      const data = await response.json();

      // Flatten all flags from categories
      const allFlags = [
        ...data.payments,
        ...data.seller,
        ...data.buyer,
        ...data.admin,
      ];

      this.flags.clear();
      allFlags.forEach((flag: any) => {
        this.flags.set(flag.flag_name, flag.enabled);
      });

      this.lastUpdate = Date.now();
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  }

  private async ensureLoaded(): Promise<void> {
    if (Date.now() - this.lastUpdate > this.CACHE_TTL) {
      await this.loadFlags();
    }
  }

  async isEnabled(flagName: string): Promise<boolean> {
    await this.ensureLoaded();
    return this.flags.get(flagName) ?? false;
  }

  // Convenience methods for common features
  async payments() {
    return {
      stripe: await this.isEnabled('STRIPE_PAYMENTS'),
      commissions: await this.isEnabled('COMMISSION_SYSTEM'),
      payouts: await this.isEnabled('PAYOUT_SYSTEM'),
      subscriptions: await this.isEnabled('SELLER_SUBSCRIPTIONS'),
    };
  }

  async seller() {
    return {
      liveCommerce: await this.isEnabled('LIVE_COMMERCE'),
      analytics: await this.isEnabled('SELLER_ANALYTICS'),
      bulkUpload: await this.isEnabled('BULK_LISTING_UPLOAD'),
    };
  }

  async buyer() {
    return {
      visualSearch: await this.isEnabled('VISUAL_SEARCH'),
      aiDescriptions: await this.isEnabled('AI_DESCRIPTIONS'),
      savedSearches: await this.isEnabled('SAVED_SEARCHES'),
      priceTracking: await this.isEnabled('PRICE_TRACKING'),
    };
  }

  async admin() {
    return {
      fraudDetection: await this.isEnabled('FRAUD_DETECTION'),
      moderationQueue: await this.isEnabled('MODERATION_QUEUE'),
      manualVerification: await this.isEnabled('MANUAL_VERIFICATION'),
    };
  }

  // Synchronous check (uses cached value, may be stale)
  isEnabledSync(flagName: string): boolean {
    return this.flags.get(flagName) ?? false;
  }

  clearCache(): void {
    this.flags.clear();
    this.lastUpdate = 0;
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagsClient.getInstance();

// Helper hook for React components
import { useEffect, useState } from 'react';

export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    featureFlags.isEnabled(flagName).then(setEnabled);
  }, [flagName]);

  return enabled;
}

export function useFeatureFlags() {
  const [flags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    featureFlags.loadFlags().then(() => {
      setLoading(false);
    });
  }, []);

  return { flags, loading };
}
