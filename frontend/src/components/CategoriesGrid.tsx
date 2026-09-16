import Link from 'next/link';

const CATEGORIES = [
  { id: 1, name: 'Electronics', count: 1240 },
  { id: 2, name: 'Furniture', count: 856 },
  { id: 3, name: 'Vehicles', count: 423 },
  { id: 4, name: 'Fashion', count: 2105 },
  { id: 5, name: 'Books', count: 512 },
  { id: 6, name: 'Sports', count: 789 },
];

export default function CategoriesGrid() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12">Browse by Category</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600">
                {category.count} listings
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
