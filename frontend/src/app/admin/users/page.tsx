'use client';

import { DataTable, FilterPanel } from '@/components/admin';
import { Card, Badge } from '@/components';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'moderator' | 'user' | 'seller';
  status: 'active' | 'inactive' | 'banned';
  listings: number;
  joinDate: string;
  lastActive: string;
}

const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Ahmed Al Mazrouei',
    email: 'ahmed@example.com',
    phone: '+971 50 123 4567',
    role: 'seller',
    status: 'active',
    listings: 45,
    joinDate: '2021-03-15',
    lastActive: '1 hour ago',
  },
  {
    id: 2,
    name: 'Fatima Al Mansoori',
    email: 'fatima@example.com',
    phone: '+971 50 987 6543',
    role: 'user',
    status: 'active',
    listings: 0,
    joinDate: '2023-06-20',
    lastActive: '2 hours ago',
  },
  {
    id: 3,
    name: 'Mohammed Al Kaabi',
    email: 'mohammed@example.com',
    phone: '+971 50 555 1111',
    role: 'moderator',
    status: 'active',
    listings: 0,
    joinDate: '2022-01-10',
    lastActive: '30 min ago',
  },
];

export default function UsersPage() {
  const [filters, setFilters] = useState({});
  const [users, setUsers] = useState(MOCK_USERS);

  const columns: any[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge variant="blue">{row.original.role.toUpperCase()}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const variant = row.original.status === 'active' ? 'green' : 'red';
        return <Badge variant={variant as any}>{row.original.status.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: 'listings',
      header: 'Listings',
    },
    {
      accessorKey: 'lastActive',
      header: 'Last Active',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:underline text-sm">Edit</button>
          <button className="text-red-600 hover:underline text-sm">Ban</button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600 mb-6">{users.length} total users</p>

        <Card className="mb-6">
          <FilterPanel filters={filters} onChange={setFilters} />
          <DataTable columns={columns} data={users} />
        </Card>
      </div>
    </div>
  );
}
