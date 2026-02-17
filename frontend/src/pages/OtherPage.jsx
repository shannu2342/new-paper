import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import DateSelector from '../components/DateSelector.jsx';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';
import EmptyState from '../components/EmptyState.jsx';

const OtherPage = () => {
  const { language, t } = useTranslator();
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
        <h1>{t('otherPage.title')}</h1>
      </section>
      <section className="archive-panel">
        <h2>{t('otherPage.previousEditions')}</h2>
        <DateSelector
          label={t('otherPage.selectDate')}
          value={selectedDate}
          onChange={(value) => {
            setDate(value);
            navigate('/');
          }}
        />
      </section>

      <section className="other-categories">
        {categories.length === 0 ? (
          <EmptyState
            title={t('otherPage.noCategoriesForDate')}
            description="Choose another date to explore archives."
            actionLabel="Home"
            actionTo="/"
          />
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
