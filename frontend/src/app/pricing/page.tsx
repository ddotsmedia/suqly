import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Seller Plans',
  description: 'Choose a Suqly seller plan. Free and premium options help your listings stand out.',
};

const POINTS = [
  { title: 'Choose a plan', text: 'Compare what each seller plan includes and pick the one that fits your business.' },
  { title: 'Get featured', text: 'Feature a listing to show it higher to buyers browsing Suqly.' },
  { title: 'Built for sellers', text: 'Track your listings and respond to buyers from your seller dashboard.' },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Seller plans</h1>
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            Pick the option that fits how you sell. Compare plans and choose when you are ready.
          </p>
          <Link href="/subscriptions" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Compare plans
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {POINTS.map((p) => (
            <div key={p.title} className="p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{p.title}</h2>
              <p className="text-gray-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 text-center">
        <p className="text-gray-600 mb-4">Not sure yet? Learn how selling works first.</p>
        <Link href="/sell" className="text-blue-600 font-semibold hover:text-blue-700">Read about selling on Suqly →</Link>
      </section>

      <Footer />
    </main>
  );
}
