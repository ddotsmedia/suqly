import { create } from 'zustand';

export interface SavedSearch {
  id: number;
  userId: number;
  name: string;
  query: Record<string, any>;
  filters: Record<string, any>;
  emailAlert: boolean;
  frequency: 'daily' | 'weekly' | 'never';
  createdAt: string;
  updatedAt: string;
}

interface SavedSearchesStore {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: string | null;
  setSavedSearches: (searches: SavedSearch[]) => void;
  addSavedSearch: (search: SavedSearch) => void;
  updateSavedSearch: (search: SavedSearch) => void;
  deleteSavedSearch: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSavedSearchesStore = create<SavedSearchesStore>((set) => ({
  savedSearches: [],
  isLoading: false,
  error: null,

  setSavedSearches: (searches) => set({ savedSearches: searches }),

  addSavedSearch: (search) =>
    set((state) => ({
      savedSearches: [search, ...state.savedSearches],
    })),

  updateSavedSearch: (search) =>
    set((state) => ({
      savedSearches: state.savedSearches.map((s) =>
        s.id === search.id ? search : s,
      ),
    })),

  deleteSavedSearch: (id) =>
    set((state) => ({
      savedSearches: state.savedSearches.filter((s) => s.id !== id),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
