import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';
import EmptyState from '../components/EmptyState.jsx';

const EpaperPage = () => {
  const { language, t } = useTranslator();
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
        <h1>{t('epaperPage.title')}</h1>
      </section>
      <section className="epaper-card">
        {!epaper ? (
          <EmptyState title={t('epaperPage.notFound')} description="Select another date for available editions." />
        ) : (
          <div>
            <div className="epaper-title">{epaper.dateKey}</div>
            {downloadUrl ? (
              <a className="download-button" href={downloadUrl} target="_blank" rel="noreferrer">
                {t('epaperPage.download')}
              </a>
            ) : (
              <div className="empty">{t('epaperPage.notAvailableForLang')}</div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default EpaperPage;
