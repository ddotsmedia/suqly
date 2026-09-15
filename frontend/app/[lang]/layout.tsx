import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suqly - UAE Marketplace',
  description: 'Find available local listings, understand what is verified, complete with confidence',
};

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const direction = params.lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={params.lang} dir={direction}>
      <body>{children}</body>
    </html>
  );
}
