import Link from 'next/link';
import { EMIRATES } from '@/lib/site';

export default function EmiratesGrid() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Emirate</h2>
          <p className="text-gray-600">Find listings in every emirate across the UAE</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EMIRATES.map((emirate) => (
            <Link
              key={emirate.slug}
              href={`/emirates/${emirate.slug}`}
              className="rounded-xl border border-gray-200 bg-white px-5 py-6 font-semibold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              {emirate.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
