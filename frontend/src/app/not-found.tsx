import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-sm font-semibold text-blue-600 mb-2">404</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-700 mb-8">The page you are looking for has moved or does not exist.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Go to homepage
          </Link>
          <Link href="/listings" className="px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50">
            Browse listings
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
