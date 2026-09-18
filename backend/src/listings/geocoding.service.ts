import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private geocodeCache: Map<string, any> = new Map();

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const cacheKey = `${lat.toFixed(6)}_${lng.toFixed(6)}`;

    if (this.geocodeCache.has(cacheKey)) {
      return this.geocodeCache.get(cacheKey);
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not set, using fallback address');
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
      );

      if (response.data.results && response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address;
        this.geocodeCache.set(cacheKey, address);
        return address;
      }
    } catch (error) {
      this.logger.error(`Reverse geocoding failed: ${error.message}`);
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  async forwardGeocode(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
  } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not set, cannot geocode address');
      return null;
    }

    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
      );

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
        };
      }
    } catch (error) {
      this.logger.error(`Forward geocoding failed: ${error.message}`);
    }

    return null;
  }

  async searchNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    listings: any[],
  ): Promise<any[]> {
    return listings.filter((listing) => {
      if (!listing.latitude || !listing.longitude) return false;

      const distance = this.calculateDistance(lat, lng, listing.latitude, listing.longitude);
      return distance <= radiusKm;
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
