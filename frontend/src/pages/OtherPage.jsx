import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import DateSelector from '../components/DateSelector.jsx';
import { useDate } from '../contexts/DateContext.jsx';

const OtherPage = () => {
  const { language } = useLanguage();
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
  const { selectedDate, setDate } = useDate();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [epaper, setEpaper] = useState(null);

  useEffect(() => {
    api.get('/categories?type=other').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    api
      .get(`/epapers?date=${selectedDate}`)
      .then((data) => setEpaper(data[0] || null))
      .catch(() => setEpaper(null));
  }, [selectedDate]);

  return (
    <main className="page">
      <section className="page-header">
        <h1>{t('Other', 'ఇతరాలు', 'अन्य')}</h1>
      </section>
      <section className="archive-panel">
        <h2>{t('Previous Editions', 'పాత సంచికలు', 'पिछले संस्करण')}</h2>
        <DateSelector
          label={t('Select Date', 'తేదీ ఎంచుకోండి', 'तारीख चुनें')}
          value={selectedDate}
          onChange={(value) => {
            setDate(value);
            navigate('/');
          }}
        />
      </section>
      <section className="other-actions">
        {epaper ? (
          <a
            className="epaper-link"
            href={language === 'te' ? epaper.teluguPdfUrl : epaper.englishPdfUrl || epaper.teluguPdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('Download E-Paper', 'ఇ-పేపర్ డౌన్‌లోడ్', 'ई-पेपर डाउनलोड करें')}
          </a>
        ) : (
          <Link className="epaper-link" to="/epaper">
            {t('Open E-Paper', 'ఇ-పేపర్ తెరవండి', 'ई-पेपर खोलें')}
          </Link>
        )}
      </section>
      <section className="other-categories">
        {categories.length === 0 ? (
          <div className="empty">{t('No categories yet.', 'కేటగిరీలు లేవు.', 'कोई श्रेणियां नहीं हैं।')}</div>
        ) : null}
        {categories.map((category) => (
          <Link key={category._id} to={`/other/${category._id}`} className="other-category">
            {category.title?.[language] || category.title?.en || category.title?.te}
          </Link>
        ))}
      </section>
    </main>
  );
};

export default OtherPage;
