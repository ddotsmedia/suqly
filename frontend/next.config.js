/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost:3000',
      'suqly.com',
      'images.suqly.com',
      'cdn.suqly.com',
      's3.wasabisys.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
