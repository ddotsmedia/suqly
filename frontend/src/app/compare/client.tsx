'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MAX_ITEMS = 3;

type CompareListing = {
  id: number;
  title: string;
  price: number | string;
  emirate?: string;
  condition?: string;
  category?: string;
  createdAt?: string;
};

export default function CompareClient() {
  const [ids, setIds] = useState<number[]>([]);
  const [items, setItems] = useState<(CompareListing | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('ids') || '';
    const parsed = raw
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, MAX_ITEMS);
    setIds(Array.from(new Set(parsed)));
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return (data.data as CompareListing) || null;
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) {
        setItems(results);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const syncUrl = (next: number[]) => {
    const url = new URL(window.location.href);
    if (next.length) url.searchParams.set('ids', next.join(','));
    else url.searchParams.delete('ids');
    window.history.replaceState(null, '', url.toString());
  };

  const addId = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const id = Number(input.trim());
    if (!Number.isInteger(id) || id <= 0) {
      setMessage('Enter a valid listing number.');
      return;
    }
    if (ids.includes(id)) {
      setMessage('That listing is already in the comparison.');
      return;
    }
    if (ids.length >= MAX_ITEMS) {
      setMessage(`You can compare up to ${MAX_ITEMS} listings.`);
      return;
    }
    const next = [...ids, id];
    setIds(next);
    syncUrl(next);
    setInput('');
  };

  const removeId = (id: number) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    syncUrl(next);
  };

  const rows: { label: string; render: (l: CompareListing) => React.ReactNode }[] = [
    { label: 'Price', render: (l) => <span className="font-semibold">AED {l.price}</span> },
    { label: 'Emirate', render: (l) => l.emirate || '—' },
    { label: 'Category', render: (l) => l.category || '—' },
    { label: 'Condition', render: (l) => l.condition || 'Not specified' },
    { label: 'Listed', render: (l) => (l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : '—') },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare listings</h1>
        <p className="text-gray-600 mb-6">Add up to {MAX_ITEMS} listings by their number to see them side by side.</p>

        <form onSubmit={addId} className="flex flex-wrap gap-3 mb-6">
          <label htmlFor="compare-id" className="sr-only">Listing number</label>
          <input
            id="compare-id"
            type="text"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Listing number, e.g. 42"
            className="px-4 py-2 rounded-lg border border-gray-300 w-56 focus:outline-none focus:border-blue-600"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Add
          </button>
        </form>
        {message && <p role="alert" className="text-red-600 mb-4">{message}</p>}

        {ids.length === 0 && (
          <p className="text-gray-700">
            No listings to compare yet. Open any listing and copy its number from the address bar, or{' '}
            <Link href="/search" className="text-blue-600 font-semibold">browse listings</Link>.
          </p>
        )}

        {ids.length > 0 && loading && <p className="text-gray-600">Loading…</p>}

        {ids.length > 0 && !loading && (
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 w-32 text-gray-500 font-medium">Details</th>
                  {ids.map((id, i) => {
                    const l = items[i];
                    return (
                      <th key={id} className="text-left p-4 align-top min-w-[220px]">
                        {l ? (
                          <Link href={`/listings/${l.id}`} className="text-blue-600 font-semibold hover:underline">
                            {l.title}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Listing #{id} not found</span>
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => removeId(id)}
                            className="mt-2 text-xs text-gray-500 underline hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100">
                    <td className="p-4 text-gray-500">{row.label}</td>
                    {items.map((l, i) => (
                      <td key={ids[i]} className="p-4 text-gray-800">
                        {l ? row.render(l) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
