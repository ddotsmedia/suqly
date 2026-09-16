'use client';

import { Card, Button, Input, Alert, PriceDisplay } from '@/components';
import { useState } from 'react';

export default function CheckoutContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreed, setAgreed] = useState(false);

  const listing = {
    id: id,
    title: 'iPhone 14 Pro Max',
    price: 3500,
    seller: { name: 'Ahmed Al Mazrouei', rating: 4.8 },
    image: '/placeholder.jpg',
  };

  const handleCheckout = async () => {
    if (!cardName || !cardNumber || !expiryDate || !cvv) {
      setError('All fields required');
      return;
    }
    if (!agreed) {
      setError('Must accept terms');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`,
        },
        body: JSON.stringify({ listing_id: id, amount: listing.price }),
      });

      if (res.ok) {
        window.location.href = '/checkout/success';
      } else {
        setError('Payment failed');
      }
    } catch (err) {
      setError('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <Card>
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="bg-gray-200 w-full h-40 rounded flex items-center justify-center">
                <p className="text-gray-600">Listing Image</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{listing.title}</h3>
                <p className="text-gray-600 text-sm">ID: {listing.id}</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Seller</span>
                  <span className="font-semibold">{listing.seller.name}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Rating</span>
                  <span>{listing.seller.rating} ⭐</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <PriceDisplay amount={listing.price} size="lg" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <Card>
            <h2 className="text-2xl font-bold mb-4">Payment Details</h2>

            {error && <Alert variant="error" message={error} onClose={() => setError('')} />}

            <div className="space-y-4">
              <Input
                label="Cardholder Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />

              <Input
                label="Card Number"
                placeholder="4532 1234 5678 9010"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="MM/YY"
                  placeholder="12/25"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
                <Input
                  label="CVV"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to terms and conditions
                </span>
              </label>

              <Button
                onClick={handleCheckout}
                isLoading={loading}
                className="w-full"
              >
                Complete Purchase
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
