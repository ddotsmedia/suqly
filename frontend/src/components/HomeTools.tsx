import Link from 'next/link';

const TOOLS = [
  {
    href: '/search/visual',
    title: 'Visual Search',
    description: 'Upload a photo to find similar items on Suqly.',
    icon: '🔍',
  },
  {
    href: '/live',
    title: 'Live Sessions',
    description: 'Watch sellers show items live and ask questions.',
    icon: '🎥',
  },
  {
    href: '/subscriptions',
    title: 'Seller Plans',
    description: 'Compare plans to list more items and get featured.',
    icon: '⭐',
  },
];

export default function HomeTools() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tools</h2>
        <p className="text-gray-600 mb-8">More ways to search, buy and sell on Suqly</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
            >
              <div className="text-4xl mb-4" aria-hidden="true">{tool.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                {tool.title} <span aria-hidden="true">→</span>
              </h3>
              <p className="text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
