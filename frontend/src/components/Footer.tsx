import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Suqly
            </h3>
            <p className="text-sm leading-relaxed text-gray-500 mb-4">
              Your trusted marketplace for verified local listings in UAE.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">f</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">𝕏</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">in</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Browse</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/listings" className="text-gray-400 hover:text-white transition">All Listings</Link></li>
              <li><Link href="/listings" className="text-gray-400 hover:text-white transition">Categories</Link></li>
              <li><Link href="/listings" className="text-gray-400 hover:text-white transition">Trending Now</Link></li>
              <li><Link href="/listings" className="text-gray-400 hover:text-white transition">Sale Items</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Sell</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/sell" className="text-gray-400 hover:text-white transition">Start Selling</Link></li>
              <li><Link href="/seller/dashboard" className="text-gray-400 hover:text-white transition">Seller Dashboard</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition">Seller Help</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              <li><Link href="/safety" className="text-gray-400 hover:text-white transition">Safety Tips</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
              <li><Link href="/press" className="text-gray-400 hover:text-white transition">Press</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              &copy; 2026 Suqly. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">🔒 SSL Encrypted</span>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">✓ Verified Sellers</span>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">💎 Buyer Protection</span>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
