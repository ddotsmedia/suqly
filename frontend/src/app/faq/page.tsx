import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FAQ - Suqly',
  description: 'Answers to common questions about buying and selling on Suqly.',
};

const FAQS = [
  {
    q: 'What is Suqly?',
    a: 'Suqly is an online marketplace in the UAE where people buy and sell items and services. You can browse listings for free.',
  },
  {
    q: 'Do I need an account to browse?',
    a: 'No. You can browse listings without signing in. You need an account to contact sellers, save items, or post a listing.',
  },
  {
    q: 'How do I sign in?',
    a: 'Enter your mobile number and we will send you a one-time code by SMS. Enter the code to sign in.',
  },
  {
    q: 'How do I post a listing?',
    a: 'Sign in, choose Sell, and fill in the details of your item. You can add photos, a price and a description before you publish.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'Open a listing and use the contact options on the page. Be careful about what you share before you have checked the item.',
  },
  {
    q: 'How do I find something specific?',
    a: 'Use the search and filters on the Listings page to narrow results by category, location and price.',
  },
  {
    q: 'How do I edit or remove my listing?',
    a: 'Go to your seller dashboard. From there you can edit or delete your listings.',
  },
  {
    q: 'What are seller plans?',
    a: 'Seller plans are optional paid options that help your listings stand out. You can compare them on the Pricing page.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently asked questions</h1>
          <p className="text-lg text-gray-700">Quick answers about using Suqly.</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto divide-y divide-gray-200">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-900">
                {item.q}
                <span className="ml-4 text-blue-600 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
