'use client';

import { useMemo } from 'react';

interface ListingMapProps {
  listings: Array<{
    id: number;
    title: string;
    price: number;
    latitude?: number;
    longitude?: number;
    image?: string;
    priceTier?: 'free' | 'premium';
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function ListingMap({
  listings,
  center = { lat: 25.2048, lng: 55.2708 },
  zoom = 12,
}: ListingMapProps) {

  const filteredListings = useMemo(
    () => listings.filter((l) => l.latitude && l.longitude),
    [listings],
  );

  const mapUrl = useMemo(() => {
    if (filteredListings.length === 0) {
      return `https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${center.lat},${center.lng}&zoom=${zoom}`;
    }

    const markers = filteredListings
      .map((l) => `markers=size:mid|color:${l.priceTier === 'premium' ? 'gold' : 'blue'}|${l.latitude},${l.longitude}`)
      .join('&');

    return `https://maps.googleapis.com/maps/api/staticmap?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${center.lat},${center.lng}&zoom=${zoom}&size=600x400&${markers}`;
  }, [filteredListings, center, zoom]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      {filteredListings.length > 0 ? (
        <div className="relative w-full h-full">
          <img
            src={mapUrl}
            alt="Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow">
            {filteredListings.length} listings
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No listings with location data available</p>
        </div>
      )}
    </div>
  );
}
