import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Safety Tips',
  description: 'Simple steps to buy and sell safely on Suqly.',
};

const TIPS = [
  {
    title: 'Never share your one-time code',
    text: 'Suqly will ask for your sign-in code only when you sign in. Do not share it with anyone, including people who say they are from Suqly.',
  },
  {
    title: 'Meet in a public place',
    text: 'When you meet to exchange an item, choose a busy, well-lit place and consider bringing someone with you.',
  },
  {
    title: 'Check before you pay',
    text: 'Look at the item in person, or ask for clear photos and details, before you send any money.',
  },
  {
    title: 'Be careful with advance payments',
    text: 'Do not pay deposits or shipping fees for items you have not seen. Requests to pay outside a secure method are a common warning sign.',
  },
  {
    title: 'Trust your instincts',
    text: 'If a price seems too good to be true, or a seller pushes you to decide quickly, slow down or walk away.',
  },
  {
    title: 'Protect your personal details',
    text: 'Share only what you need to complete a sale. Avoid posting your home address, bank details or ID numbers in listings or messages.',
  },
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Safety tips</h1>
          <p className="text-lg text-gray-700">Simple steps that help you buy and sell with confidence.</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {TIPS.map((tip) => (
            <div key={tip.title} className="p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{tip.title}</h2>
              <p className="text-gray-600">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 text-center">
        <p className="text-gray-600 mb-4">Have a question about using Suqly?</p>
        <div className="flex justify-center gap-6">
          <Link href="/faq" className="text-blue-600 font-semibold hover:text-blue-700">Read the FAQ →</Link>
          <Link href="/help" className="text-blue-600 font-semibold hover:text-blue-700">Visit the help center →</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
