import type { Metadata } from 'next';
import { absoluteUrl, API_URL, findCategory, findEmirate, primaryImage } from '@/lib/site';
import { breadcrumbJsonLd, keywordsFor } from '@/lib/seo';
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
    return { title: 'Listing not found', robots: { index: false, follow: true } };
  }

  const categoryName = findCategory(listing.category)?.name ?? listing.category;
  const emirateName = listing.emirate ? findEmirate(listing.emirate)?.name ?? listing.emirate : 'UAE';
  const priceText =
    listing.price !== null && listing.price !== undefined
      ? ` Price AED ${Number(listing.price).toLocaleString('en-US')}.`
      : '';
  const fallback = `${listing.title}: ${categoryName} for sale in ${emirateName}, UAE.${priceText} Buy and sell locally on Suqly.`;
  const description = (listing.description ? `${listing.description} ${priceText}`.trim() : fallback)
    .toString()
    .slice(0, 160);
  const image = primaryImage(listing);

  return {
    title: `${listing.title} in ${emirateName}`,
    description,
    keywords: keywordsFor(
      listing.title,
      `${categoryName} for sale ${emirateName}`,
      `${categoryName} ${emirateName} UAE`,
    ),
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

  const categoryName = listing ? findCategory(listing.category)?.name ?? listing.category : null;
  const breadcrumbs = listing
    ? breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        ...(listing.category ? [{ name: categoryName!, path: `/categories/${listing.category}` }] : []),
        { name: listing.title, path: `/listings/${id}` },
      ])
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
        />
      )}
      <ListingDetailContent />
    </>
  );
}
