import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <StaticPage title="Cookie Policy">
      <p>The full cookie policy is being finalised and will be published here.</p>
    </StaticPage>
  );
}
