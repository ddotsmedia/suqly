'use client';

import { DataTable, FilterPanel, BulkActionBar } from '@/components/admin';
import { Badge, Card } from '@/components';
import { useState } from 'react';

interface FlaggedListing {
  id: number;
  image: string;
  title: string;
  reason: string;
  flagCount: number;
  confidence: number;
  admin: string;
  date: string;
}

const MOCK_LISTINGS: FlaggedListing[] = [
  {
    id: 1,
    image: '📱',
    title: 'iPhone 14 Pro Max',
    reason: 'Suspicious Price',
    flagCount: 3,
    confidence: 75,
    admin: 'Ahmed',
    date: '2026-09-15',
  },
  {
    id: 2,
    image: '👜',
    title: 'Fake Designer Bag',
    reason: 'Banned Keyword',
    flagCount: 5,
    confidence: 92,
    admin: 'Fatima',
    date: '2026-09-14',
  },
  {
    id: 3,
    image: '💻',
    title: 'Gaming Laptop',
    reason: 'Duplicate Listing',
    flagCount: 2,
    confidence: 45,
    admin: 'Mohammed',
    date: '2026-09-13',
  },
];

export default function ModerationQueuePage() {
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [listings, setListings] = useState(MOCK_LISTINGS);

  const columns: any[] = [
    {
      id: 'select',
      header: '✓',
      cell: (props: any) => (
        <input
          type="checkbox"
          checked={selectedRows.has(props.row?.original?.id)}
          onChange={(e) => {
            const newSelection = new Set(selectedRows);
            if (e.target.checked) {
              newSelection.add(props.row?.original?.id);
            } else {
              newSelection.delete(props.row?.original?.id);
            }
            setSelectedRows(newSelection);
          }}
        />
      ),
    },
    {
      accessorKey: 'title',
      header: 'Listing',
      cell: (props: any) => <span className="font-semibold">{props.row?.original?.title}</span>,
    },
    {
      accessorKey: 'reason',
      header: 'Flag Reason',
      cell: (props: any) => <Badge variant="yellow">{props.row?.original?.reason}</Badge>,
    },
    {
      accessorKey: 'flagCount',
      header: 'Flags',
      cell: (props: any) => <span className="font-bold">{props.row?.original?.flagCount}</span>,
    },
    {
      accessorKey: 'confidence',
      header: 'AI Confidence',
      cell: (props: any) => {
        const conf = props.row?.original?.confidence;
        const variant = conf > 80 ? 'red' : conf > 60 ? 'yellow' : 'green';
        return <Badge variant={variant as any}>{conf}%</Badge>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex gap-2">
          <button className="text-green-600 hover:underline text-sm font-semibold">Approve</button>
          <button className="text-red-600 hover:underline text-sm font-semibold">Reject</button>
        </div>
      ),
    },
  ];

  const handleApproveAll = () => {
    setListings(listings.filter((l) => !selectedRows.has(l.id)));
    setSelectedRows(new Set());
  };

  const handleRejectAll = () => {
    setListings(listings.filter((l) => !selectedRows.has(l.id)));
    setSelectedRows(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Moderation Queue</h1>
        <p className="text-gray-600 mb-6">{listings.length} pending reviews</p>

        <Card className="mb-6">
          <FilterPanel filters={filters} onChange={setFilters} />
          <BulkActionBar
            selectedCount={selectedRows.size}
            onApprove={handleApproveAll}
            onReject={handleRejectAll}
          />
          <DataTable columns={columns} data={listings} />
        </Card>
      </div>
    </div>
  );
}
