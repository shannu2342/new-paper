import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switch">
      <h3>Switch Language (భాష మార్చండి)</h3>
      <div className="switch-buttons">
        <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
          English
        </button>
        <button type="button" className={language === 'te' ? 'active' : ''} onClick={() => setLanguage('te')}>
          తెలుగు
        </button>
        <button type="button" className={language === 'ta' ? 'active' : ''} onClick={() => setLanguage('ta')}>
          Tamil
        </button>
        <button type="button" className={language === 'kn' ? 'active' : ''} onClick={() => setLanguage('kn')}>
          Kannada
        </button>
        <button type="button" className={language === 'ml' ? 'active' : ''} onClick={() => setLanguage('ml')}>
          Malayalam
        </button>
        <button type="button" className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>
          Hindi
        </button>
        <button type="button" className={language === 'bn' ? 'active' : ''} onClick={() => setLanguage('bn')}>
          Bengali
        </button>
        <button type="button" className={language === 'mr' ? 'active' : ''} onClick={() => setLanguage('mr')}>
          Marathi
        </button>
        <button type="button" className={language === 'pa' ? 'active' : ''} onClick={() => setLanguage('pa')}>
          Punjabi
        </button>
        <button type="button" className={language === 'or' ? 'active' : ''} onClick={() => setLanguage('or')}>
          Odia
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitch;
