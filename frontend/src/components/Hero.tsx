import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Find Verified Local Listings
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-100">
          Discover what's available locally. Understand what's verified. Complete with confidence.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <input
            type="text"
            placeholder="Search listings..."
            className="px-4 py-3 rounded text-gray-900 flex-1 md:max-w-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button className="px-8 py-3 bg-accent hover:bg-red-700 transition rounded font-semibold">
            Search
          </button>
        </div>

        <div className="flex justify-center gap-8 text-sm">
          <Link href="/browse" className="hover:text-gray-100">
            Browse All
          </Link>
          <Link href="/categories" className="hover:text-gray-100">
            Categories
          </Link>
          <Link href="/trending" className="hover:text-gray-100">
            Trending
          </Link>
        </div>
      </div>
    </section>
  );
}
