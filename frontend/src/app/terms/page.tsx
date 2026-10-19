import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Use',
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Use">
      <p>The full terms of use are being finalised and will be published here.</p>
    </StaticPage>
  );
}
