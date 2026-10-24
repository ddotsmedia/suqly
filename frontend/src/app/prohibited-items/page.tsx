import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Prohibited Items',
  robots: { index: false, follow: true },
};

export default function ProhibitedItemsPage() {
  return (
    <StaticPage title="Prohibited Items">
      <p>
        Some items cannot be listed on Suqly. Listings for these items will be removed, and repeat breaches may lead
        to account suspension.
      </p>
      <p>Prohibited items include, but are not limited to:</p>
      <ul className="list-disc ps-6 space-y-2">
        <li>Weapons, ammunition and explosives.</li>
        <li>Illegal drugs, drug paraphernalia and prescription medicines sold without a valid prescription.</li>
        <li>Stolen goods and items you do not have the right to sell.</li>
        <li>Counterfeit or pirated goods.</li>
        <li>Alcohol and tobacco, unless a seller holds the required licence.</li>
        <li>Live animals and animal products that are restricted by UAE law.</li>
      </ul>
      <p>
        If you believe a listing breaks these rules, use the report option on the listing.
      </p>
    </StaticPage>
  );
}
