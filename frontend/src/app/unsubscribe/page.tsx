import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: true },
};

export default function UnsubscribePage() {
  return (
    <StaticPage title="Unsubscribe">
      <p>
        To stop receiving emails from Suqly, use the unsubscribe link at the bottom of the email you received.
      </p>
      <p>
        If you cannot find that link, <Link href="/contact" className="text-blue-600 underline">contact us</Link> and
        we will remove your address from our mailing lists.
      </p>
    </StaticPage>
  );
}
