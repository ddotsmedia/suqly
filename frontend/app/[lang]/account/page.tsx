'use client';

import { useState, useEffect } from 'react';

export default function AccountPage({ params }: { params: { lang: string } }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          window.location.href = `/${params.lang}`;
          return;
        }

        const response = await fetch(`http://localhost:3001/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="container py-12">Loading...</div>;
  if (!user) return <div className="container py-12">Not authenticated</div>;

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-6">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{user.displayName || user.phone}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <nav className="space-y-2">
              <a href="#" className="block p-3 bg-primary text-white rounded hover:bg-red-700">
                Dashboard
              </a>
              <a href={`/${params.lang}/account/messages`} className="block p-3 bg-gray-200 rounded hover:bg-gray-300">
                Messages
              </a>
              <a href={`/${params.lang}/account/listings`} className="block p-3 bg-gray-200 rounded hover:bg-gray-300">
                My Listings
              </a>
              <a href={`/${params.lang}/account/settings`} className="block p-3 bg-gray-200 rounded hover:bg-gray-300">
                Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600">Phone</label>
                <p className="text-lg font-medium">{user.phone}</p>
              </div>
              <div>
                <label className="text-gray-600">Email</label>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-gray-600">Role</label>
                <p className="text-lg font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-gray-600">Member Since</label>
                <p className="text-lg font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
