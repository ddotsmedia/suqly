import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Suqly</h3>
            <p className="text-sm">
              Your trusted marketplace for verified local listings in UAE.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/all" className="hover:text-white">All Listings</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/trending" className="hover:text-white">Trending</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Sell</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sell" className="hover:text-white">Start Selling</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Seller Dashboard</Link></li>
              <li><Link href="/help" className="hover:text-white">Help</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 Suqly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
