import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Press',
  robots: { index: false, follow: true },
};

export default function PressPage() {
  return (
    <StaticPage title="Press">
      <p>For press enquiries, contact details will be published here.</p>
    </StaticPage>
  );
}
