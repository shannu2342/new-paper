import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { api } from '../services/api.js';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';

const DistrictPage = () => {
  const { id } = useParams();
  const { t } = useTranslator();
  const { selectedDate } = useDate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/articles?date=${selectedDate}&categoryType=ap&district=${id}`)
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

  return (
    <main className="page">
      <section className="page-header">
        <h1>{t('districtPage.title')}</h1>
      </section>
      <section className="article-grid">
        {loading ? <SkeletonGrid count={4} /> : null}
        {!loading && articles.length === 0 ? (
          <EmptyState title={t('common.noNewsForDate')} description="Check another date for district updates." />
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default DistrictPage;
