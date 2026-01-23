import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';

const EpaperPage = () => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
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
        <h1>{t('E-Paper', 'ఇ-పేపర్', 'ई-पेपर')}</h1>
      </section>
      <section className="epaper-card">
        {!epaper ? (
          <div className="empty">{t('No e-paper for this date.', 'ఈ తేదీకి ఇ-పేపర్ లేదు.', 'इस तारीख के लिए ई-पेपर नहीं है।')}</div>
        ) : (
          <div>
            <div className="epaper-title">{epaper.dateKey}</div>
            {downloadUrl ? (
              <a className="download-button" href={downloadUrl} target="_blank" rel="noreferrer">
                {t('Download', 'డౌన్‌లోడ్', 'डाउनलोड')}
              </a>
            ) : (
              <div className="empty">
                {t('PDF not available in this language.', 'ఈ భాషలో PDF అందుబాటులో లేదు.', 'इस भाषा में पीडीएफ उपलब्ध नहीं है।')}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default EpaperPage;
