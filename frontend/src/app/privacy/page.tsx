import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>The full privacy policy is being finalised and will be published here.</p>
    </StaticPage>
  );
}
