import React, { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'news-language';
const SUPPORTED = [
  'en',
  'as',
  'bn',
  'brx',
  'doi',
  'gu',
  'hi',
  'kn',
  'ks',
  'kok',
  'mai',
  'ml',
  'mni',
  'mr',
  'ne',
  'or',
  'pa',
  'sa',
  'sat',
  'sd',
  'ta',
  'te',
  'ur'
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : 'en';
  });

  const updateLanguage = (next) => {
    if (!SUPPORTED.includes(next)) return;
    setLanguage(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ language, setLanguage: updateLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};
