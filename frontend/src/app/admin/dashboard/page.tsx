'use client';

import { Card, Badge } from '@/components';
import { useState } from 'react';

export default function AdminDashboard() {
  const [flaggedListings] = useState([
    { id: 1, title: 'Suspicious Item', reason: 'Banned Keywords', count: 3, date: '2026-09-15' },
    { id: 2, title: 'Duplicate Listing', reason: 'Duplicate Check', count: 2, date: '2026-09-14' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <p className="text-gray-600 mb-2">Total Users</p>
            <p className="text-3xl font-bold">1,234</p>
          </Card>

          <Card>
            <p className="text-gray-600 mb-2">Total Listings</p>
            <p className="text-3xl font-bold">5,678</p>
          </Card>

          <Card>
            <p className="text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold">AED 234K</p>
          </Card>

          <Card>
            <p className="text-gray-600 mb-2">Flagged Count</p>
            <p className="text-3xl font-bold text-red-600">42</p>
          </Card>
        </div>

        {/* Moderation Queue */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Moderation Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Listing</th>
                  <th className="text-left py-2">Reason</th>
                  <th className="text-center py-2">Flags</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flaggedListings.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{item.title}</td>
                    <td>
                      <Badge variant="yellow">{item.reason}</Badge>
                    </td>
                    <td className="text-center font-semibold">{item.count}</td>
                    <td>{item.date}</td>
                    <td className="space-x-2">
                      <button className="text-green-600 hover:underline text-xs font-semibold">
                        Approve
                      </button>
                      <button className="text-red-600 hover:underline text-xs font-semibold">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
