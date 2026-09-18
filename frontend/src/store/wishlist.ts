import { create } from 'zustand';

export interface WishlistItem {
  id: number;
  listingId: number;
  title: string;
  price: number;
  category: string;
  emirate: string;
  city: string;
  image: string;
  addedAt: string;
  seller: { id: number; displayName: string };
}

interface WishlistStore {
  wishlistItems: WishlistItem[];
  wishlistIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  shareToken: string | null;
  shareUrl: string | null;
  isSharingLoading: boolean;

  setWishlistItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (listingId: number) => void;
  createShareLink: (token: string, url: string) => void;
  deleteShareLink: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSharingLoading: (loading: boolean) => void;
  setShareToken: (token: string | null) => void;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  wishlistItems: [],
  wishlistIds: new Set(),
  isLoading: false,
  error: null,
  shareToken: null,
  shareUrl: null,
  isSharingLoading: false,

  setWishlistItems: (items) => {
    const ids = new Set(items.map((item) => item.listingId));
    set({ wishlistItems: items, wishlistIds: ids });
  },

  addItem: (item) =>
    set((state) => ({
      wishlistItems: [item, ...state.wishlistItems],
      wishlistIds: new Set([...state.wishlistIds, item.listingId]),
    })),

  removeItem: (listingId) =>
    set((state) => {
      const newIds = new Set(state.wishlistIds);
      newIds.delete(listingId);
      return {
        wishlistItems: state.wishlistItems.filter((i) => i.listingId !== listingId),
        wishlistIds: newIds,
      };
    }),

  createShareLink: (token, url) =>
    set({ shareToken: token, shareUrl: url }),

  deleteShareLink: () => set({ shareToken: null, shareUrl: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setSharingLoading: (loading) => set({ isSharingLoading: loading }),

  setShareToken: (token) => set({ shareToken: token }),
}));
