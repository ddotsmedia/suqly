import Link from 'next/link';
import { CATEGORIES } from '@/lib/site';

const ICONS: Record<string, string> = {
  goods: '🛍️',
  property: '🏠',
  motors: '🚗',
  jobs: '💼',
  services: '🛠️',
  businesses: '🏢',
};

export default function CategoriesGrid() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Browse by Category</h2>
          <p className="text-gray-600 text-lg">Find exactly what you&apos;re looking for</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-card hover:shadow-hover hover:border-gray-300 transition-all duration-300"
            >
              <div className="relative p-8">
                <div className="text-6xl mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
                  {ICONS[category.slug]}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>

                <div className="flex items-baseline justify-between">
                  <p className="text-gray-600">{category.description}</p>
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
