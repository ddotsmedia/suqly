import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suqly - Find Local Listings in UAE',
  description:
    'Suqly UAE Marketplace - Find available local listings, understand what is verified, complete with confidence',
  icons: {
    icon: '🛍️',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
