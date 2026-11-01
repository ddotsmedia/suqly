import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Suqly - UAE Marketplace',
    short_name: 'Suqly',
    description: 'Find verified local listings with confidence across the UAE.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [{ src: '/pwa-icon', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
