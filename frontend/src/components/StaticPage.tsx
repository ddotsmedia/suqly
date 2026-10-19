import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{title}</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
      </section>
      <Footer />
    </main>
  );
}
