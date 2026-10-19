import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCards from '@/components/ListingCards';
import { absoluteUrl, CATEGORIES, EMIRATES, fetchListingsFiltered, findEmirate } from '@/lib/site';

export function generateStaticParams() {
  return EMIRATES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const emirate = findEmirate(slug);
  if (!emirate) return { title: 'Emirate not found' };
  return {
    title: `Listings in ${emirate.name}`,
    description: `Browse listings in ${emirate.name}, UAE, on Suqly.`,
    alternates: { canonical: absoluteUrl(`/emirates/${slug}`) },
  };
}

export default async function EmiratePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const emirate = findEmirate(slug);
  if (!emirate) notFound();

  const listings = await fetchListingsFiltered({ emirate: emirate.slug });

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Listings in {emirate.name}</h1>
          <p className="text-blue-100">Browse items and services from sellers in {emirate.name}.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <ListingCards listings={listings} />
        <div className="mt-8">
          <Link href="/listings" className="text-blue-600 font-semibold hover:text-blue-700">
            See all listings →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Browse by category</h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
