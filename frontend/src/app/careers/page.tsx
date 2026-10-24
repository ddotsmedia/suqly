import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Careers',
  robots: { index: false, follow: true },
};

export default function CareersPage() {
  return (
    <StaticPage title="Careers">
      <p>There are no open roles at the moment. Check back later.</p>
    </StaticPage>
  );
}
