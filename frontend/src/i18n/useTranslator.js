import { useLanguage } from '../contexts/LanguageContext.jsx';
import { messages } from './messages.js';

const pick = (language, value) => {
  if (!value || typeof value !== 'object') return '';
  return value[language] || value.en || value.te || '';
};

const byPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

export const useTranslator = () => {
  const { language, setLanguage } = useLanguage();

  const t = (key, fallback = '') => {
    const value = byPath(messages, key);
    if (value && typeof value === 'object') {
      return pick(language, value) || fallback;
    }
    if (typeof value === 'string') {
      return value;
    }
    return fallback || key;
  };

  return { language, setLanguage, t };
};
