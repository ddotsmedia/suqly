'use client';

import { useState } from 'react';
import { Button, Input, Alert, Card } from '@/components';

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleGetOtp = async () => {
    if (!phone) {
      setError('Phone number required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setShowOtp(true);
        setError('');
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('OTP required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.data.access_token);
        }
        window.location.href = '/seller/dashboard';
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError('All fields required');
      return;
    }
    if (!termsAccepted) {
      setError('Must accept terms');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (res.ok) {
        setTab('signin');
        setError('');
        setPhone('');
        setPassword('');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError('Error registering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('signin')}
            className={`flex-1 pb-2 font-semibold border-b-2 ${
              tab === 'signin' ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 pb-2 font-semibold border-b-2 ${
              tab === 'register' ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {error && <Alert variant="error" message={error} onClose={() => setError('')} />}

        {tab === 'signin' && (
          <div className="space-y-4">
            {!showOtp ? (
              <>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Button
                  onClick={handleGetOtp}
                  isLoading={loading}
                  className="w-full"
                >
                  Get OTP
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="OTP"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  required
                />
                <Button
                  onClick={handleVerifyOtp}
                  isLoading={loading}
                  className="w-full"
                >
                  Verify & Sign In
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowOtp(false)}
                  className="w-full"
                >
                  Back
                </Button>
              </>
            )}
          </div>
        )}

        {tab === 'register' && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+971 50 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">I agree to terms</span>
            </label>
            <Button onClick={handleRegister} isLoading={loading} className="w-full">
              Create Account
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
