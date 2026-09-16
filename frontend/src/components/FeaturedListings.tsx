import Link from 'next/link';

const FEATURED = [
  { id: 1, title: 'iPhone 14 Pro Max', price: 'AED 3,500', category: 'Electronics', verified: true },
  { id: 2, title: 'Dining Table Set', price: 'AED 1,200', category: 'Furniture', verified: true },
  { id: 3, title: 'Mountain Bike', price: 'AED 800', category: 'Sports', verified: false },
  { id: 4, title: 'Winter Jacket', price: 'AED 250', category: 'Fashion', verified: true },
  { id: 5, title: 'Programming Books Bundle', price: 'AED 150', category: 'Books', verified: true },
  { id: 6, title: 'Gaming Laptop', price: 'AED 4,200', category: 'Electronics', verified: true },
];

export default function FeaturedListings() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Featured Listings</h2>
          <Link href="/all" className="text-primary hover:text-secondary font-semibold">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
            >
              <div className="bg-gray-300 h-48 relative">
                <div className="absolute top-2 right-2 bg-gray-900 text-white px-3 py-1 rounded text-sm">
                  {listing.category}
                </div>
                {listing.verified && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                    ✓ Verified
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                  {listing.title}
                </h3>
                <p className="text-2xl font-bold text-primary">{listing.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
