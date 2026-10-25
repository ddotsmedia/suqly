'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { SellerRatingBadge } from '@/components/SellerRatingBadge';
import { recordRecentlyViewed } from '@/lib/recent';

export default function ListingDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsKey, setReviewsKey] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
        const data = await res.json();
        setListing(data.data);
        if (data.data) recordRecentlyViewed(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!listing) return <div className="container py-8">Listing not found</div>;

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {listing.images?.[0] && (
            <img
              src={listing.images[0].imageUrl}
              alt={listing.title}
              fetchPriority="high"
              decoding="async"
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>

          {/* Seller info with rating */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Seller</p>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{listing.user?.displayName}</p>
              <SellerRatingBadge sellerId={listing.userId} />
            </div>
          </div>

          <div className="text-2xl font-bold text-green-600 mb-4">
            AED {listing.price}
          </div>

          {shareUrl && (
            <div className="flex flex-wrap gap-3 mb-6">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${listing.title} - AED ${listing.price} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm"
              >
                Share on WhatsApp
              </a>
              <Link href={`/listings/${id}/report`} className="px-4 py-2 rounded-lg border text-sm text-red-600">
                Report listing
              </Link>
              <button
                type="button"
                onClick={copyLink}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                {copied ? 'Link copied' : 'Copy link'}
              </button>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <p><strong>Category:</strong> {listing.category}</p>
            <p><strong>Emirate:</strong> {listing.emirate}</p>
            <p><strong>Condition:</strong> {listing.condition || 'Not specified'}</p>
            <p><strong>Posted:</strong> {new Date(listing.createdAt).toLocaleDateString()}</p>
            {listing.refreshCount > 0 && (
              <p><strong>Bumped:</strong> {listing.refreshCount} {listing.refreshCount === 1 ? 'time' : 'times'}</p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{listing.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ReviewsList key={reviewsKey} listingId={parseInt(id)} />
          </div>

          <div>
            <ReviewForm
              listingId={parseInt(id)}
              onSuccess={() => setReviewsKey(k => k + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
