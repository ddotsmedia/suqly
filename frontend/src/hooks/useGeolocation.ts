import { useState, useCallback } from 'react';

interface GeolocationCoordinates {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (error) => {
        setError(error.message || 'Failed to get your location');
        setIsLoading(false);
      },
    );
  }, []);

  return {
    ...coordinates,
    error,
    isLoading,
    requestPermission,
  };
}
