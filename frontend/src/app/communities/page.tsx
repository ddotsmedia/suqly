import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { absoluteUrl, DUBAI_COMMUNITIES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Dubai Areas',
  description: 'Browse listings by Dubai area on Suqly.',
  alternates: { canonical: absoluteUrl('/communities') },
};

export default function CommunitiesIndexPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dubai areas</h1>
        <p className="text-gray-700 mb-10">Choose an area of Dubai to see its listings.</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DUBAI_COMMUNITIES.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/communities/${area.slug}`}
                className="block border rounded-lg p-5 text-gray-900 font-semibold hover:shadow-sm transition"
              >
                {area.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
