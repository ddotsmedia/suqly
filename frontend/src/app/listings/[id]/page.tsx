import type { Metadata } from 'next';
import { absoluteUrl, API_URL, primaryImage } from '@/lib/site';
import ListingDetailContent from './client';

async function loadListing(id: string) {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadListing(id);
  if (!listing) {
    return { title: 'Listing not found' };
  }

  const description = (listing.description || `${listing.title} on Suqly, UAE marketplace.`)
    .toString()
    .slice(0, 160);
  const image = primaryImage(listing);

  return {
    title: listing.title,
    description,
    alternates: { canonical: absoluteUrl(`/listings/${id}`) },
    openGraph: {
      title: listing.title,
      description,
      url: absoluteUrl(`/listings/${id}`),
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await loadListing(id);

  // Product structured data is only added for real listings, and only with a price.
  const productJsonLd =
    listing && listing.price !== null && listing.price !== undefined
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: listing.title,
          description: listing.description || undefined,
          image: primaryImage(listing) || undefined,
          url: absoluteUrl(`/listings/${id}`),
          offers: {
            '@type': 'Offer',
            price: String(listing.price),
            priceCurrency: listing.currency || 'AED',
            url: absoluteUrl(`/listings/${id}`),
          },
        }
      : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ListingDetailContent />
    </>
  );
}
