import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Help Center - Suqly',
  description: 'Get help with buying, selling and managing your account on Suqly.',
};

const TOPICS = [
  {
    title: 'Buying on Suqly',
    text: 'Search and filter listings, then open an item to see its details and photos.',
    links: [{ label: 'Browse listings', href: '/listings' }],
  },
  {
    title: 'Selling on Suqly',
    text: 'Sign in, create a listing with clear photos and a fair price, then publish it.',
    links: [
      { label: 'How to sell', href: '/sell' },
      { label: 'Seller plans', href: '/pricing' },
    ],
  },
  {
    title: 'Your account',
    text: 'Sign in with your mobile number. We send a one-time code by SMS each time you sign in.',
    links: [{ label: 'Sign in', href: '/auth' }],
  },
  {
    title: 'Managing listings',
    text: 'Edit, pause or remove your listings from your seller dashboard.',
    links: [{ label: 'Seller dashboard', href: '/seller/dashboard' }],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Help center</h1>
          <p className="text-lg text-gray-700 mb-8">Find guides for buying, selling and managing your account.</p>
          <Link href="/faq" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Read the FAQ
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {TOPICS.map((t) => (
            <div key={t.title} className="p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.title}</h2>
              <p className="text-gray-600 mb-4">{t.text}</p>
              <div className="flex flex-wrap gap-4">
                {t.links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-blue-600 font-semibold hover:text-blue-700">
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
