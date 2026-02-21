import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';
import EmptyState from '../components/EmptyState.jsx';
import { partitions } from '../utils/apData.js';

const REGION_OPTIONS = [{ code: 'ALL', name: 'All' }, ...partitions];

const normalizeRegionCode = (value) => (value || 'ALL').toString().trim().toUpperCase();

const EpaperPage = () => {
  const { language, t } = useTranslator();
  const isTelugu = language === 'te';
  const { selectedDate } = useDate();
  const [epapers, setEpapers] = useState([]);

  useEffect(() => {
    api
      .get(`/epapers?date=${selectedDate}`)
      .then((data) => setEpapers(Array.isArray(data) ? data : []))
      .catch(() => setEpapers([]));
  }, [selectedDate]);

  const epapersByRegion = useMemo(() => {
    const map = new Map();
    epapers.forEach((item) => {
      const key = normalizeRegionCode(item.regionCode);
      if (!map.has(key)) map.set(key, item);
    });
    return map;
  }, [epapers]);

  const hasAnyEpaper = epapers.length > 0;

  const getDownloadUrl = (entry) => {
    if (!entry) return '';
    return isTelugu ? entry.teluguPdfUrl : entry.englishPdfUrl || entry.teluguPdfUrl;
  };

  const triggerDownload = (url) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
  };

  const handleRegionDownload = (regionCode) => {
    if (regionCode === 'ALL') {
      const urls = [...epapersByRegion.values()]
        .map(getDownloadUrl)
        .filter(Boolean)
        .filter((url, index, arr) => arr.indexOf(url) === index);
      urls.forEach((url) => triggerDownload(url));
      return;
    }
    const downloadUrl = getDownloadUrl(epapersByRegion.get(regionCode));
    triggerDownload(downloadUrl);
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>{t('epaperPage.title')}</h1>
      </section>
      <section className="epaper-card">
        {!hasAnyEpaper ? (
          <EmptyState title={t('epaperPage.notFound')} description="Select another date for available editions." />
        ) : (
          <div>
            <div className="epaper-title">{selectedDate}</div>
            <div className="epaper-region-grid">
              {REGION_OPTIONS.map((region) => {
                const regionCode = normalizeRegionCode(region.code);
                const isAll = regionCode === 'ALL';
                const hasDownload = isAll
                  ? [...epapersByRegion.values()].some((entry) => Boolean(getDownloadUrl(entry)))
                  : Boolean(getDownloadUrl(epapersByRegion.get(regionCode)));
                return (
                  <button key={regionCode} type="button" className="epaper-region-button" disabled={!hasDownload} onClick={() => handleRegionDownload(regionCode)}>
                    {isAll ? `${region.name} (${t('epaperPage.download')})` : region.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default EpaperPage;
