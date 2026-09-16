'use client';

import { Card, Button, Badge } from '@/components';
import { useState } from 'react';

interface Tier {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['10 listings', '2 featured', 'Standard visibility', 'Basic support'],
  },
  {
    id: 'bronze',
    name: 'Bronze',
    price: 99,
    features: ['50 listings', '5 featured', '+10% visibility boost', 'Email support'],
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 249,
    features: ['200 listings', '15 featured', '+30% visibility boost', 'Analytics dashboard', 'Priority support'],
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 499,
    features: ['Unlimited listings', '50 featured', '+50% visibility boost', 'Advanced analytics', '24/7 priority support'],
  },
];

export default function SubscriptionsPage() {
  const [currentTier] = useState('free');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (tierName: string) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier_name: tierName }),
      });

      if (res.ok) {
        window.location.href = '/subscriptions?upgraded=true';
      }
    } catch (err) {
      console.error('Upgrade failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Upgrade your account to sell more and reach more buyers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => (
            <Card key={tier.id} className={tier.popular ? 'border-blue-600 border-2 relative' : ''}>
              {tier.popular && (
                <Badge variant="blue" className="absolute -top-2 left-4">
                  Most Popular
                </Badge>
              )}

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

              <div className="mb-4">
                <p className="text-4xl font-bold">
                  {tier.price === 0 ? 'Free' : `AED ${tier.price}`}
                </p>
                {tier.price > 0 && <p className="text-gray-600 text-sm">/month</p>}
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(tier.name.toLowerCase())}
                isLoading={loading}
                disabled={currentTier === tier.id}
                variant={currentTier === tier.id ? 'secondary' : 'primary'}
                className="w-full"
              >
                {currentTier === tier.id ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
