'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCards from '@/components/ListingCards';
import { apiCall } from '@/lib/api';
import type { ListingSummary } from '@/lib/site';

interface SellerProfile {
  displayName?: string;
  sellerBio?: string;
  avatarUrl?: string;
  sellerScore?: number;
  responseRate?: number;
  avgResponseTime?: number;
  premiumTier?: string;
  profileVerified?: boolean;
  listingsCount?: number;
  joinedAt?: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function SellerProfileContent({ id }: { id: string }) {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    apiCall(`/sellers/${id}`)
      .then(async (res) => {
        if (cancelled) return;
        setSeller(res.data ?? null);
        setStatus('ready');

        // Listings and reviews are optional: a failure should not hide the profile.
        const [l, r] = await Promise.allSettled([
          apiCall(`/sellers/${id}/listings?limit=12`),
          apiCall(`/reviews/sellers/${id}`),
        ]);
        if (cancelled) return;
        if (l.status === 'fulfilled') setListings(l.value.data ?? []);
        if (r.status === 'fulfilled') {
          setReviews(r.value.data ?? []);
          setAvgRating(r.value.avgRating ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('notfound');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <p className="max-w-6xl mx-auto px-4 py-10 text-gray-600">Loading…</p>
        <Footer />
      </main>
    );
  }

  if (status === 'notfound' || !seller) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <p className="max-w-6xl mx-auto px-4 py-10 text-gray-700">This seller could not be found.</p>
        <Footer />
      </main>
    );
  }

  const name = seller.displayName || 'Seller';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex flex-col md:flex-row gap-6">
          {seller.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seller.avatarUrl} alt={name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              {seller.profileVerified && (
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">Verified</span>
              )}
              {seller.premiumTier && (
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {seller.premiumTier.toUpperCase()}
                </span>
              )}
            </div>
            {seller.joinedAt && (
              <p className="text-sm text-gray-600 mb-3">Member since {new Date(seller.joinedAt).getFullYear()}</p>
            )}
            {seller.sellerBio && <p className="text-gray-700">{seller.sellerBio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat label="Active listings" value={seller.listingsCount ?? listings.length} />
          <Stat label="Reviews" value={reviews.length} />
          <Stat label="Average rating" value={avgRating != null ? `${avgRating.toFixed(1)} / 5` : 'No reviews yet'} />
          <Stat
            label="Response rate"
            value={seller.responseRate != null ? `${seller.responseRate}%` : 'Not yet available'}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Listings</h2>
        <ListingCards listings={listings} />

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-semibold text-gray-900">{r.rating} / 5</span>
                  <span className="text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-gray-700 mt-2">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Footer />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
