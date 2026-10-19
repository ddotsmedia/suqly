'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useWishlist } from '@/hooks/useWishlist';
import { exportWishlistCSV } from '@/lib/api';

export default function WishlistPage() {
  const [signedIn, setSignedIn] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { items, isLoading, error, removeItem } = useWishlist();

  useEffect(() => {
    setSignedIn(!!localStorage.getItem('auth_token'));
  }, []);

  const exportCsv = async () => {
    try {
      setExporting(true);
      setExportError(null);
      const blob = await exportWishlistCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wishlist.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Could not export your wishlist.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          {signedIn && items.length > 0 && (
            <button
              onClick={exportCsv}
              disabled={exporting}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-blue-600 disabled:opacity-50"
            >
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          )}
        </div>

        {!signedIn && (
          <p className="text-gray-700">
            <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to see your wishlist.
          </p>
        )}
        {signedIn && isLoading && <p className="text-gray-600">Loading…</p>}
        {signedIn && error && <p className="text-red-600">Could not load your wishlist.</p>}
        {exportError && <p className="text-red-600">{exportError}</p>}
        {signedIn && !isLoading && !error && items.length === 0 && (
          <p className="text-gray-600">
            Your wishlist is empty. <Link href="/listings" className="text-blue-600 font-semibold">Browse listings</Link>.
          </p>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <li key={item.listingId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Link href={`/listings/${item.listingId}`} className="block">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} loading="lazy" className="w-full h-48 object-cover bg-gray-100" />
                ) : (
                  <div className="w-full h-48 bg-gray-100" aria-hidden="true" />
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 truncate">{item.title}</h2>
                  <p className="text-blue-600 font-bold">
                    {item.price != null ? `AED ${Number(item.price).toLocaleString()}` : 'Price on request'}
                  </p>
                  <p className="text-sm text-gray-600">{item.emirate}</p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button onClick={() => removeItem(item.listingId)} className="text-sm text-red-600 font-semibold">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
