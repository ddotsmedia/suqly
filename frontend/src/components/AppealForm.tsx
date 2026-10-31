'use client';

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';
import { currentUserId } from '@/lib/messagesSocket';

interface Flag {
  id: number;
  status: string;
  appealStatus?: string | null;
  appealDecisionNote?: string | null;
}

// Shown to the listing owner when a moderation flag was rejected.
export function AppealForm({ listingId, ownerId }: { listingId: number; ownerId: number }) {
  const [flag, setFlag] = useState<Flag | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('auth_token') || currentUserId() !== ownerId) return;
    apiCall(`/moderation/listing/${listingId}/owner`)
      .then((res) => {
        const flags: Flag[] = res?.data ?? [];
        const rejected = flags.find((f) => f.status === 'rejected');
        if (rejected) setFlag(rejected);
      })
      .catch(() => setFlag(null));
  }, [listingId, ownerId]);

  if (!flag) return null;

  if (flag.appealStatus) {
    const label =
      flag.appealStatus === 'pending'
        ? 'Your appeal is under review.'
        : flag.appealStatus === 'overturned'
          ? 'Your appeal was accepted and the listing is live again.'
          : 'Your appeal was reviewed and the decision stands.';
    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <p className="font-semibold">{label}</p>
        {flag.appealDecisionNote && <p className="text-sm text-gray-600 mt-1">{flag.appealDecisionNote}</p>}
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (reason.trim().length < 10) {
      setError('Please explain your appeal (at least 10 characters).');
      return;
    }
    setSubmitting(true);
    try {
      await apiCall(`/moderation/flag/${flag.id}/appeal`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setSent(true);
    } catch {
      setError('Could not send your appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return <p className="mt-4 p-4 border rounded-lg bg-green-50">Your appeal was sent for review.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-4 p-4 border rounded-lg bg-yellow-50">
      <p className="font-semibold mb-2">This listing was put on hold after a review.</p>
      <label htmlFor="appeal-reason" className="block text-sm mb-1">
        Appeal this decision
      </label>
      <textarea
        id="appeal-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={1000}
        className="w-full border rounded p-2 text-sm"
        placeholder="Explain why the listing should be live again"
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Send appeal'}
      </button>
    </form>
  );
}
