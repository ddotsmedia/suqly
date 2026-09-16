import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedListings from '@/components/FeaturedListings';
import CategoriesGrid from '@/components/CategoriesGrid';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CategoriesGrid />
      <FeaturedListings />
      <Footer />
    </main>
  );
}
