import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { absoluteUrl, EMIRATES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Browse by Emirate',
  description: 'Browse classified listings in every emirate of the UAE on Suqly.',
  alternates: { canonical: absoluteUrl('/emirates') },
};

export default function EmiratesIndexPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse by emirate</h1>
        <p className="text-gray-700 mb-10">Choose an emirate to see its listings.</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EMIRATES.map((emirate) => (
            <li key={emirate.slug}>
              <Link
                href={`/emirates/${emirate.slug}`}
                className="block border rounded-lg p-5 text-gray-900 font-semibold hover:shadow-sm transition"
              >
                {emirate.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
