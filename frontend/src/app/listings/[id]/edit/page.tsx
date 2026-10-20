'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';
import { CATEGORIES, DUBAI_COMMUNITIES, EMIRATES } from '@/lib/site';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].slug);
  const [emirate, setEmirate] = useState<string>(EMIRATES[0].slug);
  const [community, setCommunity] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    apiCall(`/listings/${id}`)
      .then((res) => {
        const l = res.data;
        setTitle(l.title ?? '');
        setDescription(l.description ?? '');
        setCategory(l.category ?? CATEGORIES[0].slug);
        setEmirate(l.emirate ?? EMIRATES[0].slug);
        setCommunity(l.community ?? '');
        setPrice(l.price != null ? String(l.price) : '');
        setStatus(l.status ?? '');
      })
      .catch(() => setError('Could not load this listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiCall(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          category,
          emirate,
          community: community || undefined,
          price: Number(price),
        }),
      });
      setMessage('Changes saved.');
    } catch {
      setError('Could not save changes. Only the owner can edit this listing.');
    } finally {
      setBusy(false);
    }
  }

  async function renew() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiCall('/listings/batch/renew', {
        method: 'POST',
        body: JSON.stringify({ listingIds: [Number(id)] }),
      });
      setMessage('Listing renewed.');
    } catch {
      setError('Could not renew this listing.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    try {
      await apiCall(`/listings/${id}`, { method: 'DELETE' });
      router.push('/profile');
    } catch {
      setError('Could not delete this listing.');
      setBusy(false);
    }
  }

  const communities = emirate === 'dubai' ? DUBAI_COMMUNITIES.map((c) => c.name) : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/profile" className="text-blue-600 text-sm font-semibold">← My profile</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Edit listing</h1>

        {!signedIn && (
          <p className="text-gray-700">
            <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to edit this listing.
          </p>
        )}
        {signedIn && loading && <p className="text-gray-600">Loading…</p>}

        {signedIn && !loading && (
          <>
            <p className="text-sm text-gray-600 mb-4">Status: {status || 'unknown'}</p>
            <form onSubmit={save} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Title</span>
                <input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Description</span>
                <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Category</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                    {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Price (AED)</span>
                  <input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Emirate</span>
                  <select value={emirate} onChange={(e) => { setEmirate(e.target.value); setCommunity(''); }}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                    {EMIRATES.map((em) => <option key={em.slug} value={em.slug}>{em.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Area</span>
                  {communities.length > 0 ? (
                    <select value={community} onChange={(e) => setCommunity(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                      <option value="">Select an area</option>
                      {communities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input value={community} onChange={(e) => setCommunity(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                  )}
                </label>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {message && <p className="text-green-700 text-sm">{message}</p>}

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={busy}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">
                  Save changes
                </button>
                <button type="button" disabled={busy} onClick={renew}
                  className="px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-semibold disabled:opacity-50">
                  Renew listing
                </button>
                <button type="button" disabled={busy} onClick={remove}
                  className="px-5 py-2.5 rounded-lg border border-red-600 text-red-600 font-semibold disabled:opacity-50">
                  Delete
                </button>
              </div>
            </form>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
