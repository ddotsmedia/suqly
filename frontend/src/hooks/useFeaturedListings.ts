import { useEffect, useState } from 'react';
import {
  getFeaturedListings,
  getListingFeaturedStatus,
  featureListingFree,
  featureListingPremium,
  unfeatureListing,
  getAdminFeaturedListings,
  renewFeaturedPremium,
} from '@/lib/api';
import { useFeaturedListingsStore } from '@/store/featured-listings';

export function useFeaturedListings() {
  const {
    featuredListings,
    isLoading,
    error,
    setFeaturedListings,
    setLoading,
    setError,
  } = useFeaturedListingsStore();

  const fetchFeaturedListings = async (limit = 10) => {
    try {
      setLoading(true);
      const listings = await getFeaturedListings(limit);
      setFeaturedListings(listings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  return {
    listings: featuredListings,
    isLoading,
    error,
    refetch: fetchFeaturedListings,
  };
}

export function useFeaturedStatus(listingId: number) {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const result = await getListingFeaturedStatus(listingId);
        setStatus(result);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [listingId]);

  return { ...status, isLoading };
}

export function useFeatureListing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addFeaturedListing, removeFeaturedListing } = useFeaturedListingsStore();

  const featureFree = async (listingId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const featured = await featureListingFree(listingId);
      addFeaturedListing(featured);
      return featured;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to feature listing';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const featurePremium = async (listingId: number, paymentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const featured = await featureListingPremium(listingId, paymentId);
      addFeaturedListing(featured);
      return featured;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to feature listing';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unfeature = async (listingId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await unfeatureListing(listingId);
      removeFeaturedListing(listingId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unfeature listing';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { featureFree, featurePremium, unfeature, isLoading, error };
}

export function useAdminFeaturedListings() {
  const {
    adminFeaturedListings,
    isLoading,
    error,
    setAdminFeaturedListings,
    setLoading,
    setError,
  } = useFeaturedListingsStore();

  const fetchAdminFeaturedListings = async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      const { items } = await getAdminFeaturedListings(limit, offset);
      setAdminFeaturedListings(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  return {
    listings: adminFeaturedListings,
    isLoading,
    error,
    refetch: fetchAdminFeaturedListings,
  };
}

export function useRenewFeaturedPremium() {
  const [isLoading, setIsLoading] = useState(false);

  const renew = async (listingId: number, paymentId: string) => {
    try {
      setIsLoading(true);
      return await renewFeaturedPremium(listingId, paymentId);
    } finally {
      setIsLoading(false);
    }
  };

  return { renew, isLoading };
}
