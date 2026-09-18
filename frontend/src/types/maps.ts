export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodedAddress {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface ListingCoordinates extends Coordinates {
  address?: string;
  listingId: number;
  title?: string;
}
