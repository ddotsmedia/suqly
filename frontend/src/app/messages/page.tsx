'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';

interface Conversation {
  partnerId: number;
  lastMessage: {
    content: string;
    createdAt: string;
    sender?: { id: number; displayName?: string };
    recipient?: { id: number; displayName?: string };
    listing?: { title?: string };
  };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    apiCall('/messages/conversations')
      .then((res) => setConversations(res.data ?? []))
      .catch(() => setError('Could not load your messages. Please sign in again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        {!signedIn && (
          <p className="text-gray-700">
            <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to see your messages.
          </p>
        )}
        {signedIn && loading && <p className="text-gray-600">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {signedIn && !loading && !error && conversations.length === 0 && (
          <p className="text-gray-600">No conversations yet.</p>
        )}

        <ul className="divide-y divide-gray-200 bg-white rounded-xl border border-gray-200">
          {conversations.map((c) => {
            const partner =
              c.lastMessage.sender?.id === c.partnerId ? c.lastMessage.sender : c.lastMessage.recipient;
            return (
              <li key={c.partnerId}>
                <Link href={`/messages/${c.partnerId}`} className="block p-4 hover:bg-gray-50">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-gray-900">{partner?.displayName || `User #${c.partnerId}`}</span>
                    <span className="text-xs text-gray-500">{new Date(c.lastMessage.createdAt).toLocaleDateString()}</span>
                  </div>
                  {c.lastMessage.listing?.title && (
                    <p className="text-sm text-blue-600 truncate">{c.lastMessage.listing.title}</p>
                  )}
                  <p className="text-sm text-gray-600 truncate">{c.lastMessage.content}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
