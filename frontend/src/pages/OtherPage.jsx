import React, { useEffect, useMemo, useState } from 'react';
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
  const [otherArticles, setOtherArticles] = useState([]);

  useEffect(() => {
    api
      .get(`/articles?date=${selectedDate}&categoryType=other`)
      .then(setOtherArticles)
      .catch(() => setOtherArticles([]));
  }, [selectedDate]);

  const categories = useMemo(() => {
    const map = new Map();
    otherArticles.forEach((article) => {
      const key = article.otherCategoryKey || article.category?._id;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: article.otherCategory || article.category?.title || {}
        });
      }
    });
    return Array.from(map.values());
  }, [otherArticles]);

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

      <section className="other-categories">
        {categories.length === 0 ? (
          <div className="empty">
            {t('No categories for this date.', 'ఈ తేదీకి కేటగిరీలు లేవు.', 'इस तारीख के लिए श्रेणियां नहीं हैं।')}
          </div>
        ) : null}
        {categories.map((category) => (
          <Link key={category.key} to={`/other/${category.key}`} className="other-category">
            {category.title?.[language] || category.title?.en || category.title?.te}
          </Link>
        ))}
      </section>
    </main>
  );
};

export default OtherPage;
