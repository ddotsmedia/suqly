import { useEffect, useState } from 'react';
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  updateSavedSearch,
} from '@/lib/api';
import { useSavedSearchesStore } from '@/store/saved-searches';

export function useSavedSearches() {
  const { savedSearches, isLoading, error, setSavedSearches, setLoading, setError } = useSavedSearchesStore();
  const [hasMore, setHasMore] = useState(false);

  const fetchSavedSearches = async (limit = 10, offset = 0) => {
    try {
      setLoading(true);
      const { data, total } = await getSavedSearches(limit, offset);
      setSavedSearches(data);
      setHasMore(offset + limit < total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch searches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  return { data: savedSearches, isLoading, error, refetch: fetchSavedSearches, hasMore };
}

export function useSaveSearch(query: Record<string, any>, filters: Record<string, any>) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addSavedSearch } = useSavedSearchesStore();

  const save = async (name: string, emailAlert: boolean, frequency: string) => {
    try {
      setIsSaving(true);
      setError(null);
      const savedSearch = await createSavedSearch(name, query, filters, emailAlert, frequency);
      addSavedSearch(savedSearch);
      return savedSearch;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save search';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving, error };
}

export function useDeleteSavedSearch() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteSavedSearch: deleteFromStore } = useSavedSearchesStore();

  const deleteSearch = async (id: number) => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteSavedSearch(id);
      deleteFromStore(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete search';
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { delete: deleteSearch, isDeleting, error };
}

export function useUpdateSavedSearch() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateSavedSearch: updateInStore } = useSavedSearchesStore();

  const update = async (
    id: number,
    name: string,
    query: Record<string, any>,
    filters: Record<string, any>,
    emailAlert: boolean,
    frequency: string,
  ) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updated = await updateSavedSearch(id, name, query, filters, emailAlert, frequency);
      updateInStore(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update search';
      setError(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { update, isUpdating, error };
}
