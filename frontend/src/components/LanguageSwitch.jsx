import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);

  return (
    <div className="language-switch">
      <h3>{t('Switch Language', 'భాష మార్చండి', 'भाषा बदलें')}</h3>
      <div className="switch-buttons">
        <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
          English
        </button>
        <button type="button" className={language === 'te' ? 'active' : ''} onClick={() => setLanguage('te')}>
          తెలుగు
        </button>
        <button type="button" className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>
          हिंदी
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitch;
