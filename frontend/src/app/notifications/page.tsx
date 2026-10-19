'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  const load = () =>
    apiCall('/notifications?limit=50')
      .then((res) => setItems(res.data ?? []))
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    load();
    // load is stable for this page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (id: number) => {
    try {
      await apiCall(`/notifications/${id}/mark-read`, { method: 'POST' });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      setError('Could not mark notification as read.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>

        {!signedIn && (
          <p className="text-gray-700">
            <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to see your notifications.
          </p>
        )}
        {signedIn && loading && <p className="text-gray-600">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {signedIn && !loading && !error && items.length === 0 && (
          <p className="text-gray-600">You have no notifications.</p>
        )}

        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 bg-white ${n.isRead ? 'border-gray-200' : 'border-blue-300'}`}
            >
              <div className="flex justify-between gap-4">
                <p className={`font-semibold ${n.isRead ? 'text-gray-800' : 'text-gray-900'}`}>{n.title}</p>
                <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              {!n.isRead && (
                <button onClick={() => markRead(n.id)} className="mt-2 text-sm text-blue-600 font-semibold">
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
