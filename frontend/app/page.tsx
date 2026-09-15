'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const EMIRATES = [
  { code: 'dubai', name: 'Dubai', ar: 'دبي' },
  { code: 'abudhabi', name: 'Abu Dhabi', ar: 'أبو ظبي' },
  { code: 'sharjah', name: 'Sharjah', ar: 'الشارقة' },
  { code: 'ajman', name: 'Ajman', ar: 'عجمان' },
  { code: 'umm_al_quwain', name: 'Umm Al Quwain', ar: 'أم القيوين' },
  { code: 'ras_al_khaimah', name: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  { code: 'fujairah', name: 'Fujairah', ar: 'الفجيرة' },
  { code: 'al_ain', name: 'Al Ain', ar: 'العين' },
];

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [selectedEmirate, setSelectedEmirate] = useState<string>('');

  const handleEmirate = (emirateCode: string) => {
    const lang = language === 'ar' ? 'ar' : 'en';
    router.push(`/${lang}?emirate=${emirateCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Suqly</h1>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 bg-primary rounded-lg hover:bg-red-700 transition-colors"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container py-20 text-center">
        <h2 className="text-5xl font-bold mb-4">
          {language === 'en'
            ? 'Find Available Local Listings'
            : 'اعثر على قوائم محلية متاحة'}
        </h2>
        <p className="text-2xl text-gray-300 mb-12">
          {language === 'en'
            ? 'Understand what is verified. Complete with confidence.'
            : 'افهم ما يتم التحقق منه. أكمل بثقة.'}
        </p>
      </div>

      {/* Emirate Selector */}
      <div className="container mb-20">
        <h3 className="text-2xl font-bold mb-8 text-center">
          {language === 'en' ? 'Select Your Emirate' : 'اختر إمارتك'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EMIRATES.map((emirate) => (
            <button
              key={emirate.code}
              onClick={() => handleEmirate(emirate.code)}
              className="p-6 bg-gray-700 hover:bg-primary rounded-lg transition-colors text-lg font-semibold"
            >
              {language === 'en' ? emirate.name : emirate.ar}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-800 py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="text-xl font-bold mb-2">
                {language === 'en' ? 'Verified Listings' : 'قوائم مثبتة'}
              </h4>
              <p className="text-gray-300">
                {language === 'en'
                  ? 'Seller verification badges'
                  : 'شارات التحقق من البائع'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-xl font-bold mb-2">
                {language === 'en' ? 'Direct Messaging' : 'الرسائل المباشرة'}
              </h4>
              <p className="text-gray-300">
                {language === 'en'
                  ? 'Real-time communication'
                  : 'التواصل في الوقت الفعلي'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="text-xl font-bold mb-2">
                {language === 'en' ? 'Easy Search' : 'بحث سهل'}
              </h4>
              <p className="text-gray-300">
                {language === 'en'
                  ? 'Powerful filters'
                  : 'عوامل تصفية قوية'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-8 text-center text-gray-400">
        <p>© 2026 Suqly. All rights reserved.</p>
      </footer>
    </div>
  );
}
