'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';

interface VerificationFlags {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
}

export default function VerifyPage() {
  const [flags, setFlags] = useState<VerificationFlags | null>(null);
  const [status, setStatus] = useState<'loading' | 'signedOut' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    apiCall('/users/me')
      .then((res) => {
        if (cancelled) return;
        const d = res.data ?? {};
        setFlags({
          emailVerified: !!d.emailVerified,
          phoneVerified: !!d.phoneVerified,
          idVerified: !!d.idVerified,
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('signedOut');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification</h1>
        <p className="text-gray-600 mb-8">
          Verified accounts help buyers trust your listings.
        </p>

        {status === 'loading' && <p className="text-gray-600">Loading...</p>}

        {status === 'error' && (
          <p className="text-red-700">Your verification status could not be loaded. Please try again later.</p>
        )}

        {status === 'signedOut' && (
          <p className="text-gray-700">
            Please{' '}
            <Link href="/auth" className="text-blue-700 underline">
              sign in
            </Link>{' '}
            to see your verification status.
          </p>
        )}

        {status === 'ready' && flags && (
          <ul className="space-y-3">
            <Row label="Phone number" verified={flags.phoneVerified} note="Confirmed when you sign in with a one-time code." />
            <Row label="Email address" verified={flags.emailVerified} note="Email verification is not available yet." />
            <Row
              label="Identity (ID)"
              verified={flags.idVerified}
              note="Upload your ID to get verified."
              href="/seller/verification"
              linkText="Go to ID verification"
            />
          </ul>
        )}
      </section>
      <Footer />
    </main>
  );
}

function Row({
  label,
  verified,
  note,
  href,
  linkText,
}: {
  label: string;
  verified: boolean;
  note: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <li className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-gray-900">{label}</span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {verified ? 'Verified' : 'Not verified'}
        </span>
      </div>
      <p className="text-sm text-gray-600">{note}</p>
      {!verified && href && linkText && (
        <Link href={href} className="text-sm text-blue-700 hover:underline">
          {linkText}
        </Link>
      )}
    </li>
  );
}
