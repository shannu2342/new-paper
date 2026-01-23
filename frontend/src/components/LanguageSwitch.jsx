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
        <button type="button" className={language === 'as' ? 'active' : ''} onClick={() => setLanguage('as')}>
          Assamese
        </button>
        <button type="button" className={language === 'bn' ? 'active' : ''} onClick={() => setLanguage('bn')}>
          Bengali
        </button>
        <button type="button" className={language === 'brx' ? 'active' : ''} onClick={() => setLanguage('brx')}>
          Bodo
        </button>
        <button type="button" className={language === 'doi' ? 'active' : ''} onClick={() => setLanguage('doi')}>
          Dogri
        </button>
        <button type="button" className={language === 'gu' ? 'active' : ''} onClick={() => setLanguage('gu')}>
          Gujarati
        </button>
        <button type="button" className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>
          Hindi
        </button>
        <button type="button" className={language === 'kn' ? 'active' : ''} onClick={() => setLanguage('kn')}>
          Kannada
        </button>
        <button type="button" className={language === 'ks' ? 'active' : ''} onClick={() => setLanguage('ks')}>
          Kashmiri
        </button>
        <button type="button" className={language === 'kok' ? 'active' : ''} onClick={() => setLanguage('kok')}>
          Konkani
        </button>
        <button type="button" className={language === 'mai' ? 'active' : ''} onClick={() => setLanguage('mai')}>
          Maithili
        </button>
        <button type="button" className={language === 'ml' ? 'active' : ''} onClick={() => setLanguage('ml')}>
          Malayalam
        </button>
        <button type="button" className={language === 'mni' ? 'active' : ''} onClick={() => setLanguage('mni')}>
          Meitei
        </button>
        <button type="button" className={language === 'mr' ? 'active' : ''} onClick={() => setLanguage('mr')}>
          Marathi
        </button>
        <button type="button" className={language === 'ne' ? 'active' : ''} onClick={() => setLanguage('ne')}>
          Nepali
        </button>
        <button type="button" className={language === 'or' ? 'active' : ''} onClick={() => setLanguage('or')}>
          Odia
        </button>
        <button type="button" className={language === 'pa' ? 'active' : ''} onClick={() => setLanguage('pa')}>
          Punjabi
        </button>
        <button type="button" className={language === 'sa' ? 'active' : ''} onClick={() => setLanguage('sa')}>
          Sanskrit
        </button>
        <button type="button" className={language === 'sat' ? 'active' : ''} onClick={() => setLanguage('sat')}>
          Santali
        </button>
        <button type="button" className={language === 'sd' ? 'active' : ''} onClick={() => setLanguage('sd')}>
          Sindhi
        </button>
        <button type="button" className={language === 'ta' ? 'active' : ''} onClick={() => setLanguage('ta')}>
          Tamil
        </button>
        <button type="button" className={language === 'te' ? 'active' : ''} onClick={() => setLanguage('te')}>
          తెలుగు
        </button>
        <button type="button" className={language === 'ur' ? 'active' : ''} onClick={() => setLanguage('ur')}>
          Urdu
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitch;
