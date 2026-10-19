'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useDeleteSavedSearch, useSavedSearches } from '@/hooks/useSavedSearches';
import { getSavedSearchResults } from '@/lib/api';

interface SearchResult {
  id: number;
  title: string;
  price: number | null;
}

export default function SavedSearchesPage() {
  const [signedIn, setSignedIn] = useState(true);
  const { data, isLoading, error } = useSavedSearches();
  const { delete: deleteSearch, error: deleteError } = useDeleteSavedSearch();
  const [openId, setOpenId] = useState<number | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    setSignedIn(!!localStorage.getItem('auth_token'));
  }, []);

  const toggleResults = async (id: number) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    setResultsLoading(true);
    try {
      const res = await getSavedSearchResults(id);
      setResults(res.data ?? res ?? []);
    } catch {
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved Searches</h1>

        {!signedIn && (
          <p className="text-gray-700">
            <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to see your saved searches.
          </p>
        )}
        {signedIn && isLoading && <p className="text-gray-600">Loading…</p>}
        {signedIn && error && <p className="text-red-600">Could not load your saved searches.</p>}
        {deleteError && <p className="text-red-600">{deleteError}</p>}
        {signedIn && !isLoading && !error && data.length === 0 && (
          <p className="text-gray-600">You have no saved searches yet.</p>
        )}

        <ul className="space-y-4">
          {data.map((s) => (
            <li key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between gap-4 items-start">
                <div>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.emailAlert ? `Email alerts: ${s.frequency}` : 'No email alerts'}
                  </p>
                </div>
                <div className="flex gap-4 text-sm font-semibold whitespace-nowrap">
                  <button onClick={() => toggleResults(s.id)} className="text-blue-600">
                    {openId === s.id ? 'Hide results' : 'Show results'}
                  </button>
                  <button onClick={() => deleteSearch(s.id)} className="text-red-600">Delete</button>
                </div>
              </div>

              {openId === s.id && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                  {resultsLoading && <p className="text-sm text-gray-600">Loading…</p>}
                  {!resultsLoading && results.length === 0 && (
                    <p className="text-sm text-gray-600">No matching listings right now.</p>
                  )}
                  <ul className="space-y-1">
                    {results.map((r) => (
                      <li key={r.id}>
                        <Link href={`/listings/${r.id}`} className="text-sm text-blue-600 hover:underline">
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
