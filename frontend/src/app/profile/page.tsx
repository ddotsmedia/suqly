'use client';

import { Card, Input, Button, Alert } from '@/components';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiCall } from '@/lib/api';

type TabType = 'account' | 'addresses' | 'preferences' | 'activity';

interface Me {
  id: number;
  email: string;
  phone: string | null;
  displayName: string | null;
  language: string;
}

interface MyListing {
  id: number;
  title: string;
  status: string;
  price?: number | string;
  createdAt: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [signedIn, setSignedIn] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [listings, setListings] = useState<MyListing[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      setSignedIn(false);
      return;
    }
    apiCall('/users/me')
      .then((res) => {
        setMe(res.data);
        setName(res.data.displayName ?? '');
        setLanguage(res.data.language ?? 'en');
      })
      .catch(() => setError('Could not load your profile.'));
    apiCall('/listings/mine')
      .then((res) => setListings(res.data ?? []))
      .catch(() => setListings([]));
  }, []);

  const handleSaveChanges = async () => {
    if (!me) return;
    setError('');
    try {
      await apiCall(`/users/${me.id}`, {
        method: 'PUT',
        body: JSON.stringify({ displayName: name, language }),
      });
      setSuccess('Changes saved.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Could not save changes.');
    }
  };

  if (!signedIn) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="max-w-6xl mx-auto text-gray-700">
          <Link href="/auth" className="text-blue-600 font-semibold">Sign in</Link> to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="space-y-2">
                <p className="font-semibold">Account</p>
                <p className="text-sm text-gray-600">{me?.displayName || name || '—'}</p>
                <p className="text-sm text-gray-600">{me?.email}</p>
                <p className="text-sm text-gray-600">{me?.phone || '—'}</p>
                <Button className="w-full mt-4" onClick={() => setActiveTab('account')}>Edit Profile</Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              {(['account', 'addresses', 'preferences', 'activity'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 font-semibold border-b-2 transition ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'account' && (
              <Card>
                {success && <Alert variant="success" message={success} />}
                {error && <Alert variant="error" message={error} />}
                <div className="space-y-4">
                  <Input
                    label="Display Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input label="Email" type="email" value={me?.email ?? ''} disabled />
                  <Input label="Phone" value={me?.phone ?? ''} disabled />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveChanges} disabled={!me}>Save Changes</Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'addresses' && (
              <Card>
                <div className="space-y-4">
                  <div className="border rounded p-4">
                    <p className="font-semibold">Dubai, UAE</p>
                    <p className="text-sm text-gray-600">123 Main Street, Dubai</p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-blue-600 text-sm">Edit</button>
                      <button className="text-red-600 text-sm">Delete</button>
                    </div>
                  </div>
                  <Button variant="secondary">Add New Address</Button>
                </div>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>SMS Notifications</span>
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="rounded"
                    />
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                  <Button onClick={handleSaveChanges} disabled={!me}>Save Preferences</Button>
                </div>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card>
                <div className="space-y-4">
                  {listings.length === 0 && <p className="text-gray-600">You have no listings yet.</p>}
                  {listings.map((l) => (
                    <div key={l.id} className="border rounded p-4">
                      <Link href={`/listings/${l.id}`} className="font-semibold text-blue-600 hover:underline">{l.title}</Link>
                      <p className="text-sm text-gray-600">
                        {l.status} · {new Date(l.createdAt).toLocaleDateString()}
                      </p>
                      {l.price !== undefined && <p className="text-sm text-blue-600 mt-1">AED {Number(l.price).toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
