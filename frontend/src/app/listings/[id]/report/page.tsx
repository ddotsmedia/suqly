'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URL } from '@/lib/site';

const REASONS = [
  { value: 'prohibited', label: 'Prohibited or illegal item' },
  { value: 'scam', label: 'Scam or fake listing' },
  { value: 'wrong_category', label: 'Wrong category' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'other', label: 'Other' },
];

export default function ReportListingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [reason, setReason] = useState(REASONS[0].value);
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [signedIn, setSignedIn] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setSignedIn(false);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/moderation/flag/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: details.trim() ? `${reason}: ${details.trim()}` : reason }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report listing</h1>
        <p className="text-gray-700 mb-8">Tell us what is wrong with this listing. Our team reviews every report.</p>

        {status === 'sent' ? (
          <p role="status" className="text-green-700 font-semibold">Thank you. Your report has been sent.</p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="block text-sm font-semibold text-gray-900 mb-1">Reason</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-900 mb-1">Details (optional)</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
              />
            </label>

            {!signedIn && (
              <p role="alert" className="text-red-600">
                Please <Link href="/auth" className="underline">sign in</Link> to report a listing.
              </p>
            )}
            {status === 'error' && (
              <p role="alert" className="text-red-600">Your report could not be sent. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send report'}
            </button>
          </form>
        )}
      </section>
      <Footer />
    </main>
  );
}
