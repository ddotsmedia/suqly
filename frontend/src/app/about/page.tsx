import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'About Suqly',
  description: 'Suqly is a UAE marketplace for goods, property, motors, jobs, services and businesses.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <StaticPage title="About Suqly">
      <p>
        Suqly is a UAE marketplace where people buy and sell goods, property, motors, jobs, services and businesses.
      </p>
      <p>
        Browse listings by emirate or category, or post your own. You can save items to a wishlist and set up saved
        searches to be alerted to new matches.
      </p>
    </StaticPage>
  );
}
