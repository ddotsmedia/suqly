'use client';

import { useState } from 'react';
import { Button } from '@/components';

export function ReviewForm({ listingId, onSuccess }: { listingId: number; onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          listingId,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      setComment('');
      setRating(5);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold mb-4">Leave a Review</h3>

      {error && <div className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Comment (max 500 chars)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.substring(0, 500))}
          placeholder="Share your experience..."
          rows={4}
          className="w-full border rounded px-3 py-2"
        />
        <span className="text-xs text-gray-500">{comment.length}/500</span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
}
