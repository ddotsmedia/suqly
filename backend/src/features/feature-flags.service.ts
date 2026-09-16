import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface FeatureFlag {
  id: number;
  flag_name: string;
  description: string;
  enabled: boolean;
  category: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class FeatureFlagsService {
  private flagCache = new Map<string, boolean>();
  private lastCacheUpdate = 0;
  private CACHE_TTL = 60000; // 60 seconds

  constructor() {}

  async getFlag(flagName: string): Promise<boolean> {
    // Try cache first
    if (Date.now() - this.lastCacheUpdate < this.CACHE_TTL) {
      if (this.flagCache.has(flagName)) {
        return this.flagCache.get(flagName) ?? false;
      }
    }

    // Fall back to database
    try {
      // In production, query the database
      // For now, return from cache
      return this.flagCache.get(flagName) ?? false;
    } catch (error) {
      console.error('Error fetching feature flag:', error);
      return false;
    }
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      // In production, query: SELECT * FROM feature_flags
      const flags: FeatureFlag[] = [
        {
          id: 1,
          flag_name: 'STRIPE_PAYMENTS',
          description: 'Enable Stripe payment processing',
          enabled: false,
          category: 'payments',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          flag_name: 'COMMISSION_SYSTEM',
          description: 'Calculate & track commissions on sales',
          enabled: false,
          category: 'payments',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          flag_name: 'PAYOUT_SYSTEM',
          description: 'Enable seller payouts & settlements',
          enabled: false,
          category: 'payments',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          flag_name: 'SELLER_SUBSCRIPTIONS',
          description: 'Premium seller subscription tiers',
          enabled: false,
          category: 'payments',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 5,
          flag_name: 'LIVE_COMMERCE',
          description: 'Enable livestream selling',
          enabled: true,
          category: 'seller',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 6,
          flag_name: 'SELLER_ANALYTICS',
          description: 'Show seller dashboard analytics',
          enabled: true,
          category: 'seller',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 7,
          flag_name: 'VISUAL_SEARCH',
          description: 'Enable image-based search',
          enabled: true,
          category: 'buyer',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 8,
          flag_name: 'AI_DESCRIPTIONS',
          description: 'Auto-generate product descriptions',
          enabled: true,
          category: 'buyer',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 9,
          flag_name: 'FRAUD_DETECTION',
          description: 'Enable AI fraud scoring',
          enabled: true,
          category: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 10,
          flag_name: 'MODERATION_QUEUE',
          description: 'Show moderation dashboard',
          enabled: true,
          category: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      this.updateCache(flags);
      return flags;
    } catch (error) {
      console.error('Error fetching all flags:', error);
      return [];
    }
  }

  async toggleFlag(flagName: string, enabled: boolean): Promise<boolean> {
    try {
      // In production: UPDATE feature_flags SET enabled = $1, updated_at = NOW() WHERE flag_name = $2
      this.flagCache.set(flagName, enabled);
      this.lastCacheUpdate = Date.now();
      return true;
    } catch (error) {
      console.error('Error toggling flag:', error);
      return false;
    }
  }

  async getFlagsByCategory(category: string): Promise<FeatureFlag[]> {
    const allFlags = await this.getAllFlags();
    return allFlags.filter((f) => f.category === category);
  }

  async batchToggleCategory(category: string, enabled: boolean): Promise<number> {
    const flags = await this.getFlagsByCategory(category);
    for (const flag of flags) {
      await this.toggleFlag(flag.flag_name, enabled);
    }
    return flags.length;
  }

  async isPaymentEnabled(): Promise<boolean> {
    return this.getFlag('STRIPE_PAYMENTS');
  }

  async isCommissionEnabled(): Promise<boolean> {
    return this.getFlag('COMMISSION_SYSTEM');
  }

  async isPayoutEnabled(): Promise<boolean> {
    return this.getFlag('PAYOUT_SYSTEM');
  }

  async isSubscriptionEnabled(): Promise<boolean> {
    return this.getFlag('SELLER_SUBSCRIPTIONS');
  }

  async isLiveCommerceEnabled(): Promise<boolean> {
    return this.getFlag('LIVE_COMMERCE');
  }

  async isVisualSearchEnabled(): Promise<boolean> {
    return this.getFlag('VISUAL_SEARCH');
  }

  async isAiDescriptionsEnabled(): Promise<boolean> {
    return this.getFlag('AI_DESCRIPTIONS');
  }

  async isFraudDetectionEnabled(): Promise<boolean> {
    return this.getFlag('FRAUD_DETECTION');
  }

  private updateCache(flags: FeatureFlag[]): void {
    this.flagCache.clear();
    flags.forEach((f) => this.flagCache.set(f.flag_name, f.enabled));
    this.lastCacheUpdate = Date.now();
  }

  clearCache(): void {
    this.flagCache.clear();
    this.lastCacheUpdate = 0;
  }
}
