'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';
import { connectMessagesSocket, currentUserId } from '@/lib/messagesSocket';
import { findRiskyPhrases } from '@/lib/scamWarnings';

const QUICK_REPLIES = [
  'Is this still available?',
  'Can you do a lower price?',
  'Please send more photos.',
  'Where can I see it?',
];

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  listingId?: number;
  sender?: { displayName?: string };
}

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const partnerId = Number(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [me, setMe] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Replies go on the listing of the latest message in this thread.
  const listingId = [...messages].reverse().find((m) => m.listingId)?.listingId;

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    setMe(currentUserId());
    apiCall(`/messages/${userId}`)
      .then((res) => setMessages([...(res.data ?? [])].reverse()))
      .catch(() => setError('Could not load this conversation.'))
      .finally(() => setLoading(false));

    const socket = connectMessagesSocket();
    if (!socket) return;
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join', {}));
    socket.on('message', (m: Message) => {
      if (m.senderId === partnerId) setMessages((prev) => [...prev, m]);
    });
    socket.on('message_sent', (ack: { id: number; recipientId: number }) => {
      if (ack.recipientId !== partnerId) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === -1 ? { ...m, id: ack.id } : m)),
      );
    });
    socket.on('error', (e: { message: string }) => {
      setError(e.message);
      setSending(false);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, partnerId]);

  function send(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !listingId || !socketRef.current) return;
    setSending(true);
    setError(null);
    // id -1 is a placeholder until the server acknowledges the message.
    setMessages((prev) => [
      ...prev,
      { id: -1, content, createdAt: new Date().toISOString(), senderId: me ?? 0, listingId },
    ]);
    socketRef.current.emit('message', { listingId, recipientId: partnerId, content });
    setDraft('');
    setSending(false);
  }

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
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <ul className="space-y-3 mb-6">
          {messages.map((m, i) => {
            const mine = me !== null && m.senderId === me;
            return (
              <li
                key={m.id === -1 ? `pending-${i}` : m.id}
                className={`rounded-xl border p-4 ${mine ? 'bg-blue-50 border-blue-200 ml-10' : 'bg-white border-gray-200 mr-10'}`}
              >
                <div className="flex justify-between gap-4 text-xs text-gray-500 mb-1">
                  <span>{mine ? 'You' : m.sender?.displayName || `User #${m.senderId}`}</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{m.content}</p>
                {!mine && findRiskyPhrases(m.content).length > 0 && (
                  <p className="mt-2 text-xs text-amber-800">
                    This message asks for payment or contact outside Suqly. Take care before paying anything.
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {signedIn && !loading && messages.length === 0 && (
          <p className="text-gray-600 mb-6">No messages yet. Start the conversation from a listing.</p>
        )}

        {signedIn && !loading && listingId && (
          <>
          <div className="mb-3 flex flex-wrap gap-2" aria-label="Quick replies">
            {QUICK_REPLIES.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setDraft(text)}
                className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-700 hover:border-blue-600"
              >
                {text}
              </button>
            ))}
          </div>
          {findRiskyPhrases(draft).length > 0 && (
            <p role="alert" className="mb-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Be careful: paying or moving this conversation outside Suqly is risky. Only pay after you have seen the item in person or through a trusted process.
            </p>
          )}
          <form onSubmit={send} className="flex gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Write a reply…"
              className="flex-1 rounded-xl border border-gray-300 p-3 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="px-5 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </form>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
