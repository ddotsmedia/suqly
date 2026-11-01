import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedListings from '@/components/FeaturedListings';
import CategoriesGrid from '@/components/CategoriesGrid';
import EmiratesGrid from '@/components/EmiratesGrid';
import HomeTools from '@/components/HomeTools';
import HomeBrowseByType from '@/components/HomeBrowseByType';
import HomeRecentlyViewed from '@/components/HomeRecentlyViewed';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
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
