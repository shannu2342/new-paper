import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const BreakingTicker = ({ items }) => {
  const { language } = useLanguage();
  if (!items.length) return null;
  const isTelugu = language === 'te';
  return (
    <div className="breaking-ticker">
      <span className="ticker-label">{isTelugu ? 'బ్రేకింగ్' : 'Breaking'}</span>
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
