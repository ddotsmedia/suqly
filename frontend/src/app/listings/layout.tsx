import type { Metadata } from 'next';
import { keywordsFor } from '@/lib/seo';

// /listings is a client page, so its metadata lives in this server layout.
// Listing detail pages set their own title, description, keywords and canonical.
export const metadata: Metadata = {
  title: 'Browse Listings in the UAE',
  description:
    'Browse verified listings across the UAE: goods, property, cars, jobs, services and businesses in Dubai, Abu Dhabi, Sharjah and more.',
  keywords: keywordsFor('UAE listings', 'browse classifieds UAE', 'find items for sale UAE'),
  alternates: { canonical: '/listings' },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
