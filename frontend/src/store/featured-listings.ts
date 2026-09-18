import { create } from 'zustand';

export interface FeaturedListing {
  id: number;
  listingId: number;
  priceTier: 'free' | 'premium';
  isActive: boolean;
  expiresAt: string;
  pricePaid: number;
  featuredAt: string;
}

interface FeaturedListingsStore {
  featuredListings: FeaturedListing[];
  adminFeaturedListings: FeaturedListing[];
  isLoading: boolean;
  error: string | null;

  setFeaturedListings: (listings: FeaturedListing[]) => void;
  setAdminFeaturedListings: (listings: FeaturedListing[]) => void;
  addFeaturedListing: (listing: FeaturedListing) => void;
  removeFeaturedListing: (listingId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFeaturedListingsStore = create<FeaturedListingsStore>((set) => ({
  featuredListings: [],
  adminFeaturedListings: [],
  isLoading: false,
  error: null,

  setFeaturedListings: (listings) => set({ featuredListings: listings }),

  setAdminFeaturedListings: (listings) => set({ adminFeaturedListings: listings }),

  addFeaturedListing: (listing) =>
    set((state) => ({
      featuredListings: [listing, ...state.featuredListings],
      adminFeaturedListings: [listing, ...state.adminFeaturedListings],
    })),

  removeFeaturedListing: (listingId) =>
    set((state) => ({
      featuredListings: state.featuredListings.filter((f) => f.listingId !== listingId),
      adminFeaturedListings: state.adminFeaturedListings.filter(
        (f) => f.listingId !== listingId,
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
