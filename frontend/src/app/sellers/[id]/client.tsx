'use client';

import { Card, Button, Badge, UserAvatar } from '@/components';
import { useState } from 'react';

const LISTINGS = [
  { id: 1, title: 'iPhone 14 Pro Max', price: 3500, condition: 'New', image: '/placeholder.jpg' },
  { id: 2, title: 'Gaming Laptop', price: 4200, condition: 'Like New', image: '/placeholder.jpg' },
  { id: 3, title: 'Mountain Bike', price: 800, condition: 'Used', image: '/placeholder.jpg' },
  { id: 4, title: 'Designer Handbag', price: 1200, condition: 'New', image: '/placeholder.jpg' },
];

export default function SellerProfileContent({ id }: { id: string }) {
  const [isFollowing, setIsFollowing] = useState(false);

  const seller = {
    id: id,
    name: 'Ahmed Al Mazrouei',
    avatar: '',
    rating: 4.8,
    responseRate: 95,
    premiumTier: 'gold',
    verified: true,
    bio: 'Professional seller with 5+ years of experience. Trusted by hundreds of happy customers!',
    totalListings: 45,
    soldListings: 132,
    memberSince: '2021-03-15',
    responseTimeHours: 2,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <UserAvatar size="lg" fallback="AM" />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{seller.name}</h1>
                {seller.verified && <Badge variant="green">Verified</Badge>}
                {seller.premiumTier && <Badge variant="blue">{seller.premiumTier.toUpperCase()}</Badge>}
              </div>

              <div className="flex gap-4 mb-4 text-sm text-gray-600">
                <span>{seller.rating} ⭐ ({seller.responseRate}% response rate)</span>
                <span>Member since {new Date(seller.memberSince).getFullYear()}</span>
              </div>

              <p className="text-gray-700 mb-4">{seller.bio}</p>

              <div className="flex gap-4">
                <Button onClick={() => setIsFollowing(!isFollowing)}>
                  {isFollowing ? '✓ Following' : 'Follow'}
                </Button>
                <Button variant="secondary">Contact Seller</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-gray-600 text-sm">Total Listings</p>
            <p className="text-2xl font-bold">{seller.totalListings}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Sold</p>
            <p className="text-2xl font-bold">{seller.soldListings}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Response Time</p>
            <p className="text-2xl font-bold">{seller.responseTimeHours}h</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-2xl font-bold">{seller.rating}/5</p>
          </Card>
        </div>

        {/* Listings */}
        <h2 className="text-2xl font-bold mb-6">Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LISTINGS.map((listing) => (
            <Card key={listing.id} className="cursor-pointer hover:shadow-md transition">
              <div className="bg-gray-300 w-full h-40 rounded mb-4 flex items-center justify-center">
                <p className="text-gray-600">Image</p>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
              <p className="text-blue-600 font-bold mb-2">AED {listing.price}</p>
              <p className="text-sm text-gray-600">{listing.condition}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
