import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund and Dispute Policy',
  description: 'How refunds and disputes work for payments and classified listings on Suqly.',
  alternates: { canonical: absoluteUrl('/refunds') },
};

export default function RefundsPage() {
  return (
    <StaticPage title="Refund and Dispute Policy">
      <p>
        Suqly is a marketplace. Buyers and sellers complete sales directly with each other, and Suqly is not a party to
        those sales. Refunds for goods or services bought from a seller are agreed between buyer and seller.
      </p>
      <p>Payments made to Suqly for paid features, such as listing promotions or subscriptions, are handled as follows:</p>
      <ul className="list-disc ps-6 space-y-2">
        <li>If a paid feature was not delivered because of a fault on our side, contact us and we will review it.</li>
        <li>If you were charged twice for the same purchase, contact us with the payment reference.</li>
        <li>Requests are reviewed within a reasonable time, and approved refunds are returned to the original payment method.</li>
      </ul>
      <p>
        To raise a dispute about a listing or a seller, use the report option on the listing and contact us with the
        details. Do not share bank or card details with anyone, including sellers.
      </p>
      <p>
        For payment questions, see our <a className="underline" href="/contact">contact page</a>.
      </p>
    </StaticPage>
  );
}
