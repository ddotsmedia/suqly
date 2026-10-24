import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { absoluteUrl, CATEGORIES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse every listing category on Suqly: goods, property, motors, jobs, services and businesses across the UAE.',
  alternates: { canonical: absoluteUrl('/categories') },
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All categories</h1>
        <p className="text-gray-700 mb-10">Choose a category to browse listings across the UAE.</p>
        <ul className="grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <li key={category.slug} className="border rounded-lg p-6 hover:shadow-sm transition">
              <Link href={`/categories/${category.slug}`} className="block">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
