import React from 'react';
import { useTranslator } from '../i18n/useTranslator.js';

const BreakingTicker = ({ items }) => {
  const { language, t } = useTranslator();
  if (!items.length) return null;
  return (
    <div className="breaking-ticker">
      <span className="ticker-label">{t('breakingTicker.label')}</span>
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
