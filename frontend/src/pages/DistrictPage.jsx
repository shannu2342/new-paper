import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { getPublicArticles } from '../services/publicNews.js';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';

const DistrictPage = () => {
  const { id } = useParams();
  const { t } = useTranslator();
  const { selectedDate } = useDate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = () =>
    getPublicArticles({ date: selectedDate, categoryType: 'ap', district: id })
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublicArticles({ date: selectedDate, categoryType: 'ap', district: id })
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch(() => {
        if (active) setArticles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDate, id]);

  useLiveRefresh(() => {
    loadArticles();
  }, [selectedDate, id], 5000);

  return (
    <main className="page">
      <section className="page-header">
        <h1>{t('districtPage.title')}</h1>
      </section>
      <section className="article-grid">
        {loading ? <SkeletonGrid count={4} /> : null}
        {!loading && articles.length === 0 ? (
          <EmptyState title={t('common.noNewsForDate')} description="No district updates are available up to the selected date." />
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default DistrictPage;
