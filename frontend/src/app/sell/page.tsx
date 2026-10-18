import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Sell on Suqly',
  description: 'List your items on Suqly in a few simple steps and reach buyers across the UAE.',
};

const BENEFITS = [
  { title: 'Simple listing', text: 'Add photos, a title and a price. Your listing is ready to publish in a few minutes.' },
  { title: 'Reach local buyers', text: 'Buyers browse by category, area and price, so the right people find your items.' },
  { title: 'Stay in control', text: 'You decide when to publish, edit or take a listing down.' },
];

const STEPS = [
  'Create your account or sign in.',
  'Add photos and details for your item.',
  'Publish, then reply to buyers who get in touch.',
];

export default function SellPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sell on Suqly</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            List your items, reach buyers across the UAE, and manage every listing from one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth" className="px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:shadow-lg transition-all">
              Start selling
            </Link>
            <Link href="/pricing" className="px-8 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-all">
              See seller plans
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {BENEFITS.map((b) => (
            <div key={b.title} className="p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{b.title}</h2>
              <p className="text-gray-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How it works</h2>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-4 items-start bg-white p-5 rounded-lg border border-gray-200">
                <span className="flex-none w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-gray-800 pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to list your first item?</h2>
        <Link href="/auth" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
          Create your account
        </Link>
      </section>

      <Footer />
    </main>
  );
}
