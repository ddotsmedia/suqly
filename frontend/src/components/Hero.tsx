'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Verified
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Local Listings
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover authentic listings from verified sellers in your neighborhood. Shop with confidence knowing every listing is genuine.
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search listings, categories, sellers..."
                className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-lg shadow-md group-hover:shadow-lg transition-all"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:shadow-md transition-all font-semibold">
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-gray-700 font-medium">Verified Listings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100% </div>
              <p className="text-gray-700 font-medium">Buyer Protected</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <p className="text-gray-700 font-medium">Support</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              href="/listings"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-semibold transition-all inline-flex items-center gap-2"
            >
              Browse Listings
              <span>→</span>
            </Link>
            <Link
              href="/sell"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all"
            >
              Start Selling
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">✓ SSL Encrypted</span>
            <span className="flex items-center gap-1">✓ Verified Sellers</span>
            <span className="flex items-center gap-1">✓ Money Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
