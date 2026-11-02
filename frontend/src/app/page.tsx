import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HomePhotoStrip from '@/components/HomePhotoStrip';
import FeaturedListings from '@/components/FeaturedListings';
import CategoriesGrid from '@/components/CategoriesGrid';
import EmiratesGrid from '@/components/EmiratesGrid';
import HomeTools from '@/components/HomeTools';
import HomeBrowseByType from '@/components/HomeBrowseByType';
import HomeRecentlyViewed from '@/components/HomeRecentlyViewed';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { keywordsFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Buy & Sell in the UAE: Verified Local Listings',
  description:
    'Buy and sell in Dubai, Abu Dhabi, Sharjah and across the UAE. Browse goods, property, cars, jobs, services and businesses on Suqly, the trusted local marketplace.',
  keywords: keywordsFor(
    'buy and sell Dubai',
    'cars for sale UAE',
    'property for rent UAE',
    'jobs UAE',
    'services UAE',
    'businesses for sale UAE',
  ),
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HomePhotoStrip />
      <HomeTools />
      <CategoriesGrid />
      <HomeBrowseByType />
      <HomeRecentlyViewed />
      <EmiratesGrid />
      <FeaturedListings />
      <Footer />
    </main>
  );
}
