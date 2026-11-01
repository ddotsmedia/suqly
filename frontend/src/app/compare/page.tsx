import type { Metadata } from 'next';
import CompareClient from './client';

export const metadata: Metadata = {
  title: 'Compare Listings',
  description: 'Compare up to three Suqly listings side by side on price, location and condition.',
};

export default function ComparePage() {
  return <CompareClient />;
}
