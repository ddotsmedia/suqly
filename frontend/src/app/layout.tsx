import type { Metadata, Viewport } from 'next';
import Analytics from '@/components/Analytics';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { SITE_URL } from '@/lib/site';
import { keywordsFor } from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Suqly - UAE Marketplace',
    template: '%s | Suqly',
  },
  description: 'Find verified local listings with confidence. Browse, buy, and sell locally in UAE.',
  keywords: keywordsFor(),
  robots: 'index, follow',
  appleWebApp: { capable: true, title: 'Suqly', statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    siteName: 'Suqly',
    locale: 'en_AE',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suqly - UAE Marketplace',
    description: 'Find verified local listings with confidence. Browse, buy, and sell locally in UAE.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Suqly',
  url: SITE_URL,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Suqly',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/listings?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
        />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
