import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const BreakingTicker = ({ items }) => {
  const { language } = useLanguage();
  if (!items.length) return null;
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
  return (
    <div className="breaking-ticker">
      <span className="ticker-label">{t('Breaking', 'బ్రేకింగ్', 'ब्रेकिंग')}</span>
      <div className="ticker-track">
        <div className="ticker-content">
          {items.map((item) => (
            <span key={item._id} className="ticker-item">
              {item.title?.[language] || item.title?.en || item.title?.te}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingTicker;
