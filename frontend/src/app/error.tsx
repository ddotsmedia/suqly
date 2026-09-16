'use client';

import { useEffect } from 'react';
import { Button } from '@/components';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">An unexpected error occurred. Please try again.</p>

        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-left">
            <p className="text-sm text-red-800 font-mono">{error.message}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button onClick={() => reset()} className="flex-1">
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/')} className="flex-1">
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
