'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Suqly
          </Link>

          <div className={`flex-1 max-w-xs relative transition-all duration-200 ${searchFocus ? 'max-w-md' : ''}`}>
            <input
              type="text"
              placeholder="Search listings, sellers..."
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
            />
            {searchFocus && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-card mt-1 p-3">
                <p className="text-sm text-gray-600">Popular searches</p>
              </div>
            )}
          </div>

          <nav className="hidden lg:flex gap-8 items-center">
            <Link href="/listings" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Browse
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Sell
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Messages
            </Link>
          </nav>

          <div className="flex gap-3">
            <Link
              href="/auth"
              className="px-4 py-2.5 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm transition-all"
            >
              Login
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md font-semibold text-sm transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
