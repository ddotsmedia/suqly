import Link from 'next/link';
import { CATEGORIES } from '@/lib/site';
import { subcategoriesFor } from '@/lib/subcategories';

export default function HomeBrowseByType() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by type</h2>
        <p className="text-gray-600 mb-8">Jump straight to what you are looking for</p>
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const subs = subcategoriesFor(category.slug);
            if (subs.length === 0) return null;
            return (
              <div key={category.slug}>
                <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {subs.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/categories/${category.slug}?sub=${s.slug}`}
                      className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 hover:border-blue-600 hover:text-blue-600"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
