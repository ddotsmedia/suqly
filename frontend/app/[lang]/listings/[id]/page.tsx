'use client';

import { useState, useEffect } from 'react';

export default function ListingDetailPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:3001/listings/${params.id}`);
        const data = await response.json();
        setListing(data.data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  if (loading) return <div className="container py-12">Loading...</div>;
  if (!listing) return <div className="container py-12">Listing not found</div>;

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images */}
        <div className="lg:col-span-2">
          <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center mb-4">
            {listing.images?.[0]?.fullUrl ? (
              <img
                src={listing.images[0].fullUrl}
                alt={listing.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {listing.images?.map((img: any, idx: number) => (
              <div key={idx} className="bg-gray-200 aspect-square rounded">
                <img
                  src={img.thumbnailUrl}
                  alt={`${listing.title} ${idx}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
          <p className="text-3xl font-bold text-primary mb-6">
            {listing.price?.toLocaleString()} {listing.currency || 'AED'}
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 mb-4">Category: {listing.category}</p>
            <p className="text-gray-600 mb-4">Emirate: {listing.emirate}</p>
            {listing.publicLocation && (
              <p className="text-gray-600 mb-4">Location: {listing.publicLocation}</p>
            )}
          </div>

          <button className="btn-primary w-full mb-3">Contact Seller</button>
          <button className="btn-secondary w-full">Report Listing</button>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
