'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiCall } from '@/lib/api';
import { CATEGORIES, DUBAI_COMMUNITIES, EMIRATES } from '@/lib/site';
import { subcategoriesFor } from '@/lib/subcategories';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_PHOTOS = 10;

export default function NewListingPage() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].slug);
  const [subcategory, setSubcategory] = useState<string>('');
  const [emirate, setEmirate] = useState<string>(EMIRATES[0].slug);
  const [community, setCommunity] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) setSignedIn(false);
  }, []);

  async function uploadPhotos(listingId: number) {
    const form = new FormData();
    photos.forEach((f) => form.append('files', f));
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_URL}/listings/upload/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error('Photo upload failed');
    const { data } = await res.json();
    for (const img of data.images as { fullUrl: string; thumbnailUrl: string }[]) {
      await apiCall(`/listings/${listingId}/images`, {
        method: 'POST',
        body: JSON.stringify({ imageUrl: img.fullUrl, thumbnailUrl: img.thumbnailUrl }),
      });
    }
  }

  async function submit(publish: boolean) {
    setError('');
    setBusy(true);
    let listingId: number | null = null;
    try {
      setStatus('Saving listing…');
      const created = await apiCall('/listings', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          subcategory: subcategory || null,
          emirate,
          community: community || undefined,
          price: Number(price),
        }),
      });
      listingId = created.data.id;

      if (photos.length > 0) {
        setStatus('Uploading photos…');
        await uploadPhotos(listingId!);
      }
      if (publish) {
        setStatus('Publishing…');
        await apiCall(`/listings/${listingId}/publish`, { method: 'POST' });
      }
      router.push('/profile');
    } catch {
      setError(
        listingId
          ? 'The listing was saved as a draft, but something failed after that. Check your profile and try again.'
          : 'Could not save the listing. Check the fields and try again.',
      );
      setBusy(false);
      setStatus('');
      if (listingId) router.push('/profile');
    }
  }

  const communities = emirate === 'dubai' ? DUBAI_COMMUNITIES.map((c) => c.name) : [];

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <section className="max-w-2xl mx-auto px-4 py-10">
          <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to post a listing.
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a listing</h1>

        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            submit(true);
          }}
          className="space-y-5 bg-white rounded-xl border border-gray-200 p-6"
        >
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
              <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Subcategory</span>
                  <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                    <option value="">Select a subcategory</option>
                    {subcategoriesFor(category).map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
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

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Photos (up to {MAX_PHOTOS}, JPEG, PNG or WebP, at least 400×300)</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS))}
              className="mt-1 block w-full text-sm" />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {status && <p className="text-gray-600 text-sm">{status}</p>}

          <div className="flex gap-3">
            <button type="button" disabled={busy || !title || !price} onClick={() => submit(false)}
              className="px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-semibold disabled:opacity-50">
              Save as draft
            </button>
            <button type="submit" disabled={busy || !title || !price}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">
              Publish
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </main>
  );
}
