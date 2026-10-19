import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCards from '@/components/ListingCards';
import {
  absoluteUrl,
  CATEGORIES,
  EMIRATES,
  fetchListingsFiltered,
  findCategory,
  findEmirate,
} from '@/lib/site';

type Params = Promise<{ slug: string; category: string }>;

// 8 emirates x 6 categories = 48 pages, built at deploy time.
export function generateStaticParams() {
  return EMIRATES.flatMap((e) => CATEGORIES.map((c) => ({ slug: e.slug, category: c.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, category } = await params;
  const emirate = findEmirate(slug);
  const cat = findCategory(category);
  if (!emirate || !cat) return { title: 'Page not found' };
  return {
    title: `${cat.name} in ${emirate.name}`,
    description: `${cat.description} Browse ${cat.name.toLowerCase()} listings in ${emirate.name}, UAE, on Suqly.`,
    alternates: { canonical: absoluteUrl(`/emirates/${slug}/${category}`) },
  };
}

export default async function EmirateCategoryPage({ params }: { params: Params }) {
  const { slug, category } = await params;
  const emirate = findEmirate(slug);
  const cat = findCategory(category);
  if (!emirate || !cat) notFound();

  const listings = await fetchListingsFiltered({ emirate: emirate.slug, category: cat.slug });

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-100 text-sm mb-2">
            <Link href={`/emirates/${emirate.slug}`} className="hover:underline">{emirate.name}</Link>
            {' / '}
            <Link href={`/categories/${cat.slug}`} className="hover:underline">{cat.name}</Link>
          </p>
          <h1 className="text-4xl font-bold mb-2">{cat.name} in {emirate.name}</h1>
          <p className="text-blue-100">{cat.description}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <ListingCards listings={listings} />
        <div className="mt-8 flex flex-wrap gap-6">
          <Link href="/listings" className="text-blue-600 font-semibold hover:text-blue-700">
            See all listings →
          </Link>
          <Link href={`/emirates/${emirate.slug}`} className="text-blue-600 font-semibold hover:text-blue-700">
            All listings in {emirate.name} →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Other categories in {emirate.name}</h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
            <Link key={c.slug} href={`/emirates/${emirate.slug}/${c.slug}`} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{cat.name} in other emirates</h2>
        <div className="flex flex-wrap gap-3">
          {EMIRATES.filter((e) => e.slug !== emirate.slug).map((e) => (
            <Link key={e.slug} href={`/emirates/${e.slug}/${cat.slug}`} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">
              {e.name}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
