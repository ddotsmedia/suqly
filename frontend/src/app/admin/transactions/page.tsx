'use client';

import { AnalyticsCard, LineChart } from '@/components/admin';
import { DataTable, Card } from '@/components';
import { useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  buyer: string;
  seller: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', date: '2026-09-15', buyer: 'Fatima', seller: 'Ahmed', amount: 3500, status: 'completed', method: 'Card' },
  { id: 'TXN-002', date: '2026-09-14', buyer: 'Mohammed', seller: 'Ahmed', amount: 4200, status: 'pending', method: 'Bank' },
  { id: 'TXN-003', date: '2026-09-13', buyer: 'Layla', seller: 'Fatima', amount: 1200, status: 'completed', method: 'Card' },
];

export default function TransactionsPage() {
  const [transactions] = useState(MOCK_TRANSACTIONS);

  const revenueData = [
    { date: '1 Sep', revenue: 15000 },
    { date: '5 Sep', revenue: 22500 },
    { date: '10 Sep', revenue: 18600 },
    { date: '15 Sep', revenue: 26700 },
  ];

  const columns: any[] = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'id',
      header: 'Transaction ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'buyer',
      header: 'Buyer',
    },
    {
      accessorKey: 'seller',
      header: 'Seller',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `AED ${row.original.amount}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const colors = {
          completed: 'text-green-600',
          pending: 'text-yellow-600',
          failed: 'text-red-600',
        };
        return <span className={`font-semibold ${colors[row.original.status]}`}>{row.original.status}</span>;
      },
    },
    {
      accessorKey: 'method',
      header: 'Method',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnalyticsCard title="Total Revenue (MTD)" value="AED 250,000" trend="+15%" icon="💰" />
          <AnalyticsCard title="Pending Payouts" value="AED 45,000" trend="+5%" icon="⏳" />
          <AnalyticsCard title="Completed Payouts (MTD)" value="AED 180,000" trend="+8%" icon="✓" />
          <AnalyticsCard title="Avg Transaction" value="AED 2,850" trend="+3%" icon="📊" />
        </div>

        {/* Chart */}
        <Card>
          <LineChart data={revenueData} dataKey="revenue" title="Revenue Trend (Last 30 Days)" height={300} />
        </Card>

        {/* Transactions Table */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <DataTable columns={columns} data={transactions} />
        </Card>
      </div>
    </div>
  );
}
