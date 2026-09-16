import Link from 'next/link';

const FEATURED = [
  { id: 1, title: 'iPhone 14 Pro Max', price: 3500, category: 'Electronics', verified: true, seller: 'Ahmed Al Mazrouei', rating: 4.8 },
  { id: 2, title: 'Dining Table Set', price: 1200, category: 'Furniture', verified: true, seller: 'Furniture Store', rating: 4.5 },
  { id: 3, title: 'Mountain Bike', price: 800, category: 'Sports', verified: false, seller: 'Sports Seller', rating: 4.2 },
  { id: 4, title: 'Winter Jacket', price: 250, category: 'Fashion', verified: true, seller: 'Fashion House', rating: 4.6 },
  { id: 5, title: 'Programming Books', price: 150, category: 'Books', verified: true, seller: 'Book Store', rating: 4.7 },
  { id: 6, title: 'Gaming Laptop', price: 4200, category: 'Electronics', verified: true, seller: 'Tech Pro', rating: 4.9 },
];

export default function FeaturedListings() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Listings</h2>
            <p className="text-gray-600">Most popular items right now</p>
          </div>
          <Link href="/listings" className="text-blue-600 hover:text-blue-700 font-bold text-lg">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-card hover:shadow-hover hover:border-blue-300 transition-all duration-300"
            >
              <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 h-56 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">
                  {listing.category === 'Electronics' && '📱'}
                  {listing.category === 'Furniture' && '🛋️'}
                  {listing.category === 'Sports' && '⚽'}
                  {listing.category === 'Fashion' && '👔'}
                  {listing.category === 'Books' && '📚'}
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>

                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    {listing.category}
                  </span>
                  {listing.verified && (
                    <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <button className="absolute bottom-3 right-3 bg-white text-gray-700 p-2.5 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                  ♥
                </button>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {listing.title}
                </h3>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    AED {listing.price.toLocaleString()}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {listing.seller.substring(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{listing.seller}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-gray-600 text-xs font-medium">{listing.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
