import { Button, Card } from '@/components';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-2">Purchase Complete!</h1>
        <p className="text-gray-600 mb-6">Your order has been successfully placed.</p>

        <div className="bg-gray-50 rounded p-4 mb-6 text-left text-sm">
          <p className="mb-2">
            <span className="font-semibold">Transaction ID:</span> TXN-2026-09-001
          </p>
          <p className="mb-2">
            <span className="font-semibold">Amount:</span> AED 3,500
          </p>
          <p>
            <span className="font-semibold">Date:</span> 2026-09-15
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/listings/1" className="block">
            <Button className="w-full">View Listing</Button>
          </Link>
          <Link href="/messages" className="block">
            <Button variant="secondary" className="w-full">
              Message Seller
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
