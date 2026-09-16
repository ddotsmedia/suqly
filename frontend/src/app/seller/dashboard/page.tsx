'use client';

import { Card, Badge, Button, PriceDisplay } from '@/components';
import { useState } from 'react';

interface Stats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  averageRating: number;
  responseRate: number;
  sellerScore: number;
  availableBalance: number;
  pendingBalance: number;
}

export default function SellerDashboard() {
  const [stats] = useState<Stats>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    averageRating: 4.5,
    responseRate: 92,
    sellerScore: 95,
    availableBalance: 15000,
    pendingBalance: 2500,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Seller Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <p className="text-gray-600 mb-2">Total Listings</p>
            <p className="text-3xl font-bold">{stats.totalListings}</p>
            <p className="text-sm text-green-600 mt-2">{stats.activeListings} active</p>
          </Card>

          <Card>
            <p className="text-gray-600 mb-2">Average Rating</p>
            <p className="text-3xl font-bold">{stats.averageRating}/5 ⭐</p>
            <p className="text-sm text-gray-600 mt-2">{stats.sellerScore} seller score</p>
          </Card>

          <Card>
            <p className="text-gray-600 mb-2">Available Balance</p>
            <p className="text-3xl font-bold">
              <PriceDisplay amount={stats.availableBalance} size="lg" />
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <PriceDisplay amount={stats.pendingBalance} size="sm" /> pending
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Create Listing</Button>
            <Button variant="secondary">View Earnings</Button>
            <Button variant="secondary">Upgrade Plan</Button>
            <Button variant="secondary">View Messages</Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Listing</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">2026-09-15</td>
                  <td>iPhone 14 Pro Max</td>
                  <td className="text-right font-semibold">AED 3,500</td>
                  <td>
                    <Badge variant="green">Completed</Badge>
                  </td>
                  <td>
                    <button className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">2026-09-14</td>
                  <td>Gaming Laptop</td>
                  <td className="text-right font-semibold">AED 4,200</td>
                  <td>
                    <Badge variant="yellow">Pending</Badge>
                  </td>
                  <td>
                    <button className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
