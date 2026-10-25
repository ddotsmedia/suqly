import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'How to buy and sell on Suqly, step by step.',
  alternates: { canonical: absoluteUrl('/how-it-works') },
};

export default function HowItWorksPage() {
  return (
    <StaticPage title="How It Works">
      <h2 className="text-2xl font-semibold text-gray-900 pt-4">Buying</h2>
      <ol className="list-decimal ps-6 space-y-2">
        <li>Browse listings or search by category and emirate.</li>
        <li>Open a listing to see photos, price and seller details.</li>
        <li>Contact the seller through the message button.</li>
        <li>Agree on the price, meeting or delivery with the seller, and check the item before paying.</li>
      </ol>
      <h2 className="text-2xl font-semibold text-gray-900 pt-4">Selling</h2>
      <ol className="list-decimal ps-6 space-y-2">
        <li>Create an account and sign in.</li>
        <li>Post your listing with clear photos, a fair price and an accurate description.</li>
        <li>Answer messages from interested buyers.</li>
        <li>Mark the item as sold or remove the listing when you are done.</li>
      </ol>
      <p>
        Read our <a className="underline" href="/safety">safety tips</a> before any meeting, and our{' '}
        <a className="underline" href="/prohibited-items">prohibited items</a> list before you post.
      </p>
    </StaticPage>
  );
}
