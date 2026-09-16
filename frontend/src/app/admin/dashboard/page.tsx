'use client';

import { AnalyticsCard, LineChart, BarChart, PieChart, WebSocketIndicator } from '@/components/admin';
import { Button } from '@/components';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [stats] = useState({
    revenue: { value: 'AED 250,000', trend: '+15%', icon: '💰' },
    users: { value: '1,234', trend: '+8%', icon: '👥' },
    listings: { value: '567', trend: '-2%', icon: '📋' },
    flagged: { value: '23', trend: '+5%', icon: '🚩' },
  });

  const revenueData = [
    { date: '1 Sep', revenue: 5000 },
    { date: '5 Sep', revenue: 7500 },
    { date: '10 Sep', revenue: 6200 },
    { date: '15 Sep', revenue: 8900 },
    { date: '20 Sep', revenue: 7100 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 120000 },
    { name: 'Furniture', value: 85000 },
    { name: 'Fashion', value: 45000 },
  ];

  const sellerData = [
    { name: 'Ahmed Al Mazrouei', revenue: 50000 },
    { name: 'Fatima Al Mansoori', revenue: 35000 },
    { name: 'Mohammed Al Kaabi', revenue: 28000 },
  ];

  useEffect(() => {
    setWsStatus('connected');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Admin</p>
          </div>
          <WebSocketIndicator status={wsStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(stats).map(([key, data]: any) => (
            <AnalyticsCard
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              value={data.value}
              trend={data.trend}
              icon={data.icon}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LineChart
              data={revenueData}
              dataKey="revenue"
              title="Revenue Trend (Last 30 Days)"
              height={300}
            />
          </div>
          <div>
            <PieChart
              data={sellerData}
              dataKey="revenue"
              nameKey="name"
              title="Top Sellers"
              height={300}
            />
          </div>
        </div>

        <div>
          <BarChart
            data={categoryData}
            dataKey="value"
            title="Revenue by Category"
            layout="vertical"
            height={250}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/moderation">
              <Button className="w-full">View Moderation Queue</Button>
            </Link>
            <Link href="/admin/transactions">
              <Button className="w-full">View Transactions</Button>
            </Link>
            <Link href="/admin/health">
              <Button className="w-full">System Health</Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
