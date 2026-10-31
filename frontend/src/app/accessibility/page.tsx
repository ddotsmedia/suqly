import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'How Suqly works to make its marketplace usable for everyone, in English and Arabic.',
};

export default function AccessibilityPage() {
  return (
    <StaticPage title="Accessibility Statement">
      <p>
        Suqly aims to make the marketplace usable for everyone, in English and Arabic, on phones, tablets and
        computers. We work towards the WCAG 2.1 AA guidelines.
      </p>
      <p>
        The site supports keyboard navigation, readable text sizes and right-to-left layout in Arabic. Images
        uploaded by sellers should include a description where possible.
      </p>
      <p>
        Some parts of the site may not yet meet every guideline. If you find a barrier, please tell us through the
        Contact page and we will look into it.
      </p>
    </StaticPage>
  );
}
