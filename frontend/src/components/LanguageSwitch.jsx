import React from 'react';
import { useTranslator } from '../i18n/useTranslator.js';

const LanguageSwitch = () => {
  const { language, setLanguage, t } = useTranslator();

  return (
    <div className="language-switch">
      <h3>{t('languageSwitch.title')}</h3>
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
