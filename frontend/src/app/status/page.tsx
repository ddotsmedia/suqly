'use client';

import { useEffect, useState } from 'react';
import StaticPage from '@/components/StaticPage';

type Check = 'checking' | 'up' | 'down';

// Live check of the public API health endpoint, run in the visitor's browser.
export default function StatusPage() {
  const [api, setApi] = useState<Check>('checking');
  const [checkedAt, setCheckedAt] = useState<string>('');

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch(`${base}/health`, { signal: controller.signal, cache: 'no-store' })
      .then((res) => setApi(res.ok ? 'up' : 'down'))
      .catch(() => setApi('down'))
      .finally(() => {
        clearTimeout(timer);
        setCheckedAt(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }));
      });
    return () => controller.abort();
  }, []);

  const label = api === 'checking' ? 'Checking...' : api === 'up' ? 'Operational' : 'Not responding';
  const color = api === 'up' ? 'text-green-700' : api === 'down' ? 'text-red-700' : 'text-gray-600';

  return (
    <StaticPage title="System Status">
      <p>
        API status: <span className={`font-semibold ${color}`}>{label}</span>
      </p>
      {checkedAt && <p className="text-sm text-gray-500">Last checked {checkedAt} (UAE time)</p>}
      <p>
        If the status shows &quot;Not responding&quot;, try again in a few minutes. For urgent issues, contact support
        through the Contact page.
      </p>
    </StaticPage>
  );
}
