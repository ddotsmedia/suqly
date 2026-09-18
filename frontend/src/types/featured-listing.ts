export interface FeaturedListing {
  id: number;
  listingId: number;
  priceTier: 'free' | 'premium';
  isActive: boolean;
  expiresAt: string;
  pricePaid: number;
  priceCurrency: string;
  lastPaymentDate?: string;
  paymentId?: string;
  featuredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedStatus {
  isFeatured: boolean;
  tier: 'free' | 'premium' | null;
  daysRemaining: number | null;
  pricePerDay: number | null;
}
