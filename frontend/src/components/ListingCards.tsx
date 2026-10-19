import Link from 'next/link';
import { ListingSummary, primaryImage } from '@/lib/site';

// Server-rendered grid used by category and emirate pages.
export default function ListingCards({ listings }: { listings: ListingSummary[] }) {
  if (listings.length === 0) {
    return <p className="text-gray-600">No listings yet. Check back soon.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => {
        const image = primaryImage(listing);
        return (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={listing.title}
                loading="lazy"
                decoding="async"
                className="w-full h-48 object-cover bg-gray-100"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100" aria-hidden="true" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
              <p className="text-green-600 font-bold mt-2">
                {listing.price === null || listing.price === undefined
                  ? 'Price on request'
                  : `${listing.currency || 'AED'} ${Number(listing.price).toLocaleString('en-US')}`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
