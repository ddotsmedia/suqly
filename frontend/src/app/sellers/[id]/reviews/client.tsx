'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function SellerReviewsContent({ id }: { id: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    apiCall(`/reviews/sellers/${id}?page=${page}`)
      .then((res) => {
        if (cancelled) return;
        setReviews(res.data ?? []);
        setTotal(res.total ?? 0);
        setAvgRating(res.avgRating ?? null);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <Link href={`/sellers/${id}`} className="text-sm text-blue-700 hover:underline">
          ← Back to seller profile
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Seller reviews</h1>
        <p className="text-gray-600 mb-8">
          {avgRating != null ? `Average rating ${avgRating.toFixed(1)} / 5 from ${total} review${total === 1 ? '' : 's'}` : 'No reviews yet'}
        </p>

        {status === 'loading' && <p className="text-gray-600">Loading reviews...</p>}

        {status === 'error' && (
          <p className="text-red-700">Reviews could not be loaded. Please try again later.</p>
        )}

        {status === 'ready' && reviews.length === 0 && (
          <p className="text-gray-600">No reviews yet.</p>
        )}

        {status === 'ready' && reviews.length > 0 && (
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

        {status === 'ready' && totalPages > 1 && (
          <nav className="flex items-center justify-between mt-8" aria-label="Review pages">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded border border-gray-300 bg-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded border border-gray-300 bg-white disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </section>
      <Footer />
    </main>
  );
}
