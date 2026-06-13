import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { getPublicArticles } from '../services/publicNews.js';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';

const OtherCategoryPage = () => {
  const { id } = useParams();
  const { t } = useTranslator();
  const { selectedDate } = useDate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = () =>
    getPublicArticles({ date: selectedDate, categoryType: 'other', otherCategoryKey: id })
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        if (safeData.length) {
          setArticles(safeData);
          return;
        }
        return getPublicArticles({ date: selectedDate, categoryType: 'other', category: id }).then((fallback) => {
          setArticles(Array.isArray(fallback) ? fallback : []);
        });
      })
      .catch(() => setArticles([]));

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublicArticles({ date: selectedDate, categoryType: 'other', otherCategoryKey: id })
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        if (!active) return;
        if (safeData.length) {
          setArticles(safeData);
          return;
        }
        return getPublicArticles({ date: selectedDate, categoryType: 'other', category: id }).then((fallback) => {
          if (active) setArticles(Array.isArray(fallback) ? fallback : []);
        });
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
        <h1>{t('otherCategoryPage.title')}</h1>
      </section>
      <section className="article-grid">
        {loading ? <SkeletonGrid count={4} /> : null}
        {!loading && articles.length === 0 ? (
          <EmptyState title={t('common.noNewsForDate')} description="No published stories are available up to the selected date." actionLabel="Other" actionTo="/other" />
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default OtherCategoryPage;
