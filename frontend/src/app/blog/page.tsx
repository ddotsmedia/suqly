import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Blog',
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return (
    <StaticPage title="Blog">
      <p>No posts yet. Check back soon.</p>
    </StaticPage>
  );
}
