'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const translations = {
  en: {
    home: 'Home',
    search: 'Search Listings',
    postListing: 'Post Listing',
    messages: 'Messages',
    account: 'Account',
    browseListings: 'Browse Listings',
    selectCategory: 'Select Category',
    goods: 'Goods',
    property: 'Property',
    motors: 'Motors',
    jobs: 'Jobs',
    services: 'Services',
    businesses: 'Businesses',
    priceMin: 'Min Price',
    priceMax: 'Max Price',
    search: 'Search',
    noListings: 'No listings found',
    aed: 'AED',
    featured: 'Featured Listings',
  },
  ar: {
    home: 'الرئيسية',
    search: 'ابحث عن القوائم',
    postListing: 'انشر إعلان',
    messages: 'الرسائل',
    account: 'الحساب',
    browseListings: 'استعرض القوائم',
    selectCategory: 'حدد الفئة',
    goods: 'السلع',
    property: 'الملكية',
    motors: 'السيارات',
    jobs: 'الوظائف',
    services: 'الخدمات',
    businesses: 'الأعمال',
    priceMin: 'السعر الأدنى',
    priceMax: 'السعر الأقصى',
    search: 'بحث',
    noListings: 'لم يتم العثور على قوائم',
    aed: 'د.إ',
    featured: 'القوائم المميزة',
  },
};

interface Listing {
  id: number;
  title: string;
  category: string;
  emirate: string;
  price: number;
  currency: string;
  description: string;
  publishedAt: string;
  images?: Array<{ thumbnailUrl: string }>;
}

export default function HomePage({ params }: { params: { lang: string } }) {
  const t = translations[params.lang as keyof typeof translations] || translations.en;
  const searchParams = useSearchParams();
  const emirate = searchParams.get('emirate');

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    emirate: emirate || '',
    priceMin: '',
    priceMax: '',
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.category) query.append('category', filters.category);
      if (filters.emirate) query.append('emirate', filters.emirate);
      if (filters.priceMin) query.append('priceMin', filters.priceMin);
      if (filters.priceMax) query.append('priceMax', filters.priceMax);

      const response = await fetch(`http://localhost:3001/listings?${query}`);
      const data = await response.json();
      setListings(data.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Suqly</h1>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              {t.search}
            </a>
            <a href="/[lang]/listings/create" className="btn-primary text-sm">
              {t.postListing}
            </a>
            <a href="/[lang]/account/messages" className="hover:text-primary transition-colors">
              {t.messages}
            </a>
            <a href="/[lang]/account" className="hover:text-primary transition-colors">
              {t.account}
            </a>
          </nav>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200 py-6">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">{t.selectCategory}</option>
              <option value="goods">{t.goods}</option>
              <option value="property">{t.property}</option>
              <option value="motors">{t.motors}</option>
              <option value="jobs">{t.jobs}</option>
              <option value="services">{t.services}</option>
              <option value="businesses">{t.businesses}</option>
            </select>

            <input
              type="number"
              placeholder={t.priceMin}
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              className="input-field"
            />

            <input
              type="number"
              placeholder={t.priceMax}
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              className="input-field"
            />

            <button onClick={fetchListings} className="btn-primary">
              {t.search}
            </button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container py-12">
        <h2 className="text-3xl font-bold mb-8">{t.featured}</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t.noListings}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <a
                key={listing.id}
                href={`/${params.lang}/listings/${listing.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  {listing.images?.[0]?.thumbnailUrl ? (
                    <img
                      src={listing.images[0].thumbnailUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{listing.category}</p>
                  <p className="text-primary font-bold text-lg">
                    {listing.price?.toLocaleString()} {listing.currency || t.aed}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container text-center">
          <p>© 2026 Suqly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
