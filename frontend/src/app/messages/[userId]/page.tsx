'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender?: { displayName?: string };
}

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    apiCall(`/messages/${userId}`)
      .then((res) => setMessages([...(res.data ?? [])].reverse()))
      .catch(() => setError('Could not load this conversation.'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/messages" className="text-blue-600 text-sm font-semibold">← All messages</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Conversation</h1>

        {!signedIn && (
          <p className="text-gray-700">
            <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to view this conversation.
          </p>
        )}
        {signedIn && loading && <p className="text-gray-600">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between gap-4 text-xs text-gray-500 mb-1">
                <span>{m.sender?.displayName || `User #${m.senderId}`}</span>
                <span>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{m.content}</p>
            </li>
          ))}
        </ul>

        {signedIn && !loading && !error && messages.length === 0 && (
          <p className="text-gray-600">No messages in this conversation.</p>
        )}
        <p className="mt-6 text-sm text-gray-500">Replying from the website is coming soon.</p>
      </section>
      <Footer />
    </main>
  );
}
