import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Classifieds Disclaimer',
  robots: { index: false, follow: true },
};

export default function DisclaimerPage() {
  return (
    <StaticPage title="Classifieds Disclaimer">
      <p>
        Suqly is an online marketplace that connects buyers and sellers. Suqly is not a party to any sale or
        agreement between users.
      </p>
      <p>
        Suqly does not inspect, verify or guarantee listed items, and does not guarantee the accuracy of any listing
        or the conduct of any user. Buyers should check an item and the seller before paying.
      </p>
      <p>
        Users are responsible for the content they post. Suqly may remove listings that break our rules.
      </p>
    </StaticPage>
  );
}
