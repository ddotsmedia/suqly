import { useEffect, useState } from 'react';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  createWishlistShareLink,
  deleteWishlistShareLink,
  exportWishlistCSV,
} from '@/lib/api';
import { useWishlistStore } from '@/store/wishlist';

export function useWishlist() {
  const {
    wishlistItems,
    isLoading,
    error,
    setWishlistItems,
    addItem,
    removeItem,
    setLoading,
    setError,
  } = useWishlistStore();
  const [hasMore, setHasMore] = useState(false);

  const fetchWishlist = async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      const { items, total } = await getWishlist(limit, offset);
      setWishlistItems(items);
      setHasMore(offset + limit < total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItemFromWishlist = async (listingId: number) => {
    try {
      await removeFromWishlist(listingId);
      removeItem(listingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      throw err;
    }
  };

  return {
    items: wishlistItems,
    isLoading,
    error,
    addItem,
    removeItem: removeItemFromWishlist,
    refetch: fetchWishlist,
    hasMore,
  };
}

export function useIsInWishlist(listingId: number) {
  const { wishlistIds } = useWishlistStore();
  return wishlistIds.has(listingId);
}

export function useAddToWishlist(listingId: number) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useWishlistStore();

  const add = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await addToWishlist(listingId);
      addItem({
        id: Math.random(),
        listingId,
        title: '',
        price: 0,
        category: '',
        emirate: '',
        city: '',
        image: '',
        addedAt: new Date().toISOString(),
        seller: { id: 0, displayName: '' },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { add, isSaving, error };
}

export function useWishlistShare() {
  const {
    shareUrl,
    shareToken,
    isSharingLoading,
    createShareLink,
    deleteShareLink,
    setSharingLoading,
  } = useWishlistStore();

  const create = async () => {
    try {
      setSharingLoading(true);
      const { shareToken, shareUrl } = await createWishlistShareLink();
      createShareLink(shareToken, shareUrl);
      return { shareToken, shareUrl };
    } catch (err) {
      throw err;
    } finally {
      setSharingLoading(false);
    }
  };

  const deleteShare = async () => {
    try {
      setSharingLoading(true);
      await deleteWishlistShareLink();
      deleteShareLink();
    } catch (err) {
      throw err;
    } finally {
      setSharingLoading(false);
    }
  };

  return {
    shareUrl,
    shareToken,
    isSaving: isSharingLoading,
    createShareLink: create,
    deleteShareLink: deleteShare,
  };
}

export function useWishlistExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = async () => {
    try {
      setIsExporting(true);
      setError(null);
      const blob = await exportWishlistCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wishlist-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export';
      setError(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCSV, isExporting, error };
}
