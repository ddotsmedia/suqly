import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Contact',
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <StaticPage title="Contact">
      <p>Our support contact details will be published here. In the meantime, see our <a className="text-blue-600 underline" href="/help">Help</a> and <a className="text-blue-600 underline" href="/faq">FAQ</a> pages.</p>
    </StaticPage>
  );
}
