'use client';

import { Card, Input, Button, Alert } from '@/components';
import { useState } from 'react';

type TabType = 'account' | 'addresses' | 'preferences' | 'activity';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [name, setName] = useState('Ahmed Al Mazrouei');
  const [email, setEmail] = useState('ahmed@example.com');
  const [phone, setPhone] = useState('+971 50 123 4567');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  const [success, setSuccess] = useState('');

  const handleSaveChanges = async () => {
    setSuccess('Changes saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

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
                <p className="text-sm text-gray-600">{name}</p>
                <p className="text-sm text-gray-600">{email}</p>
                <p className="text-sm text-gray-600">{phone}</p>
                <Button className="w-full mt-4">Edit Profile</Button>
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
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input label="Password" type="password" placeholder="••••••••" />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                    <Button variant="danger">Change Password</Button>
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
                  <Button onClick={handleSaveChanges}>Save Preferences</Button>
                </div>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card>
                <div className="space-y-4">
                  <div className="border rounded p-4">
                    <p className="font-semibold">iPhone 14 Pro Max - Purchased</p>
                    <p className="text-sm text-gray-600">2026-09-15</p>
                    <p className="text-sm text-blue-600 mt-1">AED 3,500</p>
                  </div>
                  <div className="border rounded p-4">
                    <p className="font-semibold">Gaming Laptop - Sold</p>
                    <p className="text-sm text-gray-600">2026-09-14</p>
                    <p className="text-sm text-blue-600 mt-1">AED 4,200</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
