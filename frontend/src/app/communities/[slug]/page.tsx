import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCards from '@/components/ListingCards';
import { absoluteUrl, DUBAI_COMMUNITIES, fetchListingsFiltered, findDubaiCommunity } from '@/lib/site';

export function generateStaticParams() {
  return DUBAI_COMMUNITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = findDubaiCommunity(slug);
  if (!area) return { title: 'Area not found' };
  const listings = await fetchListingsFiltered({ emirate: 'dubai', community: area.name }, 1);
  return {
    title: `Listings in ${area.name}, Dubai`,
    description: `Browse listings in ${area.name}, Dubai, on Suqly.`,
    alternates: { canonical: absoluteUrl(`/communities/${slug}`) },
    // Keep areas with no listings out of search results until they have content.
    robots: { index: listings.length > 0, follow: true },
  };
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = findDubaiCommunity(slug);
  if (!area) notFound();

  const listings = await fetchListingsFiltered({ emirate: 'dubai', community: area.name });

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-100 text-sm mb-2">
            <Link href="/emirates/dubai" className="hover:underline">Dubai</Link> / {area.name}
          </p>
          <h1 className="text-4xl font-bold">Listings in {area.name}</h1>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-10">
        <ListingCards listings={listings} />
        <div className="mt-8">
          <Link href="/emirates/dubai" className="text-blue-600 font-semibold hover:text-blue-700">
            All listings in Dubai →
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
