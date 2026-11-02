'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';

type State = 'checking' | 'success' | 'failed' | 'no-token';

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>('checking');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setState('no-token');
      return;
    }
    apiCall('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then((res) => {
        setState('success');
        setMessage(res?.message ?? 'Email verified.');
      })
      .catch((err: Error) => {
        setState('failed');
        setMessage(err.message || 'This link is invalid or has expired.');
      });
  }, []);

  async function resend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await apiCall('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
      setResent(res?.message ?? 'If that email is registered, a new link has been sent.');
    } catch {
      setResent('Could not send a new link. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify your email</h1>

        {state === 'checking' && <p className="text-gray-600">Checking your link…</p>}

        {state === 'success' && (
          <>
            <p role="status" className="text-green-700 mb-6">{message}</p>
            <Link href="/auth" className="text-blue-600 font-semibold hover:underline">Go to sign in</Link>
          </>
        )}

        {(state === 'failed' || state === 'no-token') && (
          <>
            <p role="alert" className="text-red-700 mb-6">
              {state === 'no-token' ? 'Open the link from your verification email.' : message}
            </p>
            <form onSubmit={resend} className="space-y-3 text-left">
              <label htmlFor="resend-email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="resend-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700">
                Send a new link
              </button>
              {resent && <p role="status" className="text-sm text-gray-700">{resent}</p>}
            </form>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
