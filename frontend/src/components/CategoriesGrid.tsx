import Link from 'next/link';

const CATEGORIES = [
  { id: 1, name: 'Electronics', count: 1240, icon: '📱', color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Furniture', count: 856, icon: '🛋️', color: 'from-amber-500 to-amber-600' },
  { id: 3, name: 'Vehicles', count: 423, icon: '🚗', color: 'from-red-500 to-red-600' },
  { id: 4, name: 'Fashion', count: 2105, icon: '👔', color: 'from-pink-500 to-pink-600' },
  { id: 5, name: 'Books', count: 512, icon: '📚', color: 'from-purple-500 to-purple-600' },
  { id: 6, name: 'Sports', count: 789, icon: '⚽', color: 'from-green-500 to-green-600' },
];

export default function CategoriesGrid() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Browse by Category</h2>
          <p className="text-gray-600 text-lg">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-card hover:shadow-hover hover:border-gray-300 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              <div className="relative p-8">
                <div className="text-6xl mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
                  {category.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>

                <div className="flex items-baseline justify-between">
                  <p className="text-gray-600 font-medium">
                    {category.count.toLocaleString()} listings
                  </p>
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
