import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';

const EpaperPage = () => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
  const { selectedDate } = useDate();
  const [epaper, setEpaper] = useState(null);

  useEffect(() => {
    api
      .get(`/epapers?date=${selectedDate}`)
      .then((data) => setEpaper(data[0] || null))
      .catch(() => setEpaper(null));
  }, [selectedDate]);

  const downloadUrl = isTelugu ? epaper?.teluguPdfUrl : epaper?.englishPdfUrl || epaper?.teluguPdfUrl;

  return (
    <main className="page">
      <section className="page-header">
        <h1>{isTelugu ? 'ఇ-పేపర్' : 'E-Paper'}</h1>
      </section>
      <section className="epaper-card">
        {!epaper ? (
          <div className="empty">{isTelugu ? 'ఈ తేదీకి ఇ-పేపర్ లేదు.' : 'No e-paper for this date.'}</div>
        ) : (
          <div>
            <div className="epaper-title">{epaper.dateKey}</div>
            {downloadUrl ? (
              <a className="download-button" href={downloadUrl} target="_blank" rel="noreferrer">
                {isTelugu ? 'డౌన్‌లోడ్' : 'Download'}
              </a>
            ) : (
              <div className="empty">
                {isTelugu ? 'ఈ భాషలో PDF అందుబాటులో లేదు.' : 'PDF not available in this language.'}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default EpaperPage;
