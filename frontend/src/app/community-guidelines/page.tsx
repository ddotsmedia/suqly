import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Conduct rules for buyers and sellers on Suqly.',
  alternates: { canonical: absoluteUrl('/community-guidelines') },
};

export default function CommunityGuidelinesPage() {
  return (
    <StaticPage title="Community Guidelines">
      <p>Suqly works when buyers and sellers treat each other with honesty and respect. All users must:</p>
      <ul className="list-disc ps-6 space-y-2">
        <li>Post accurate listings, with real photos and a truthful price and description.</li>
        <li>Respond to messages honestly and do not use the platform to harass, threaten or scam anyone.</li>
        <li>Keep personal and payment details private, and do not ask others for them.</li>
        <li>Follow the <a className="underline" href="/prohibited-items">prohibited items</a> policy and UAE law.</li>
        <li>Report listings or users that break these rules.</li>
      </ul>
      <p>
        Breaking these guidelines can lead to listings being removed and accounts being suspended. Read our{' '}
        <a className="underline" href="/terms">terms of service</a> for full details.
      </p>
    </StaticPage>
  );
}
