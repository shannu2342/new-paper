import React, { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import BreakingTicker from '../components/BreakingTicker.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { getPublicArticles } from '../services/publicNews.js';
import { useDate } from '../contexts/DateContext.jsx';
import { todayInput } from '../utils/date.js';
import { useTranslator } from '../i18n/useTranslator.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';

const HomePage = () => {
  const { t } = useTranslator();
  const { selectedDate } = useDate();
  const isPreviousEdition = selectedDate !== todayInput();
  const [articles, setArticles] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = () =>
    getPublicArticles({ date: selectedDate, categoryType: 'home' })
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));

  const loadBreaking = () =>
    getPublicArticles({ date: selectedDate, categoryType: 'home', isBreaking: true, limit: 10 })
      .then((data) => setBreaking(Array.isArray(data) ? data : []))
      .catch(() => setBreaking([]));

  const loadFeatured = () =>
    getPublicArticles({ date: selectedDate, categoryType: 'home', isFeatured: true, limit: 1 })
      .then((data) => setFeatured(Array.isArray(data) ? data[0] || null : null))
      .catch(() => setFeatured(null));

  const loadLatest = () =>
    getPublicArticles({ date: selectedDate, categoryType: 'home', limit: 8 })
      .then((data) => setLatest(Array.isArray(data) ? data : []))
      .catch(() => setLatest([]));

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublicArticles({ date: selectedDate, categoryType: 'home' })
      .then((data) => {
        if (active) setArticles(Array.isArray(data) ? data : []);
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
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    getPublicArticles({ date: selectedDate, categoryType: 'home', isBreaking: true, limit: 10 })
      .then((data) => {
        if (active) setBreaking(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setBreaking([]);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    getPublicArticles({ date: selectedDate, categoryType: 'home', isFeatured: true, limit: 1 })
      .then((data) => {
        if (active) setFeatured(Array.isArray(data) ? data[0] || null : null);
      })
      .catch(() => {
        if (active) setFeatured(null);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    getPublicArticles({ date: selectedDate, categoryType: 'home', limit: 8 })
      .then((data) => {
        if (active) setLatest(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setLatest([]);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  useLiveRefresh(() => {
    loadArticles();
    loadBreaking();
    loadFeatured();
    loadLatest();
  }, [selectedDate], 5000);

  return (
    <main className="page">
      {isPreviousEdition ? (
        <div className="edition-banner">
          {t('homePage.previousEdition')} {selectedDate}
        </div>
      ) : null}
      <HeroSlider />
      <BreakingTicker items={breaking} />
      <section className="page-header">
        <h1>{t('homePage.title')}</h1>
      </section>
      <section className="home-featured">
        <div className="featured-card">
          <h2>{t('homePage.featuredStory')}</h2>
          {featured ? (
            <ArticleCard article={featured} variant="featured" />
          ) : (
            <EmptyState
              title={t('homePage.noFeaturedStory')}
              description="Try another section for more highlights."
              actionLabel="Go to Top News"
              actionTo="/"
            />
          )}
        </div>
        <div className="latest-list">
          <h2>{t('homePage.latestUpdates')}</h2>
          {latest.length === 0 ? (
            <div className="empty">{t('homePage.noLatestUpdates')}</div>
          ) : (
            latest.map((item) => <ArticleCard key={item._id} article={item} />)
          )}
        </div>
      </section>
      <section className="article-grid">
        {loading ? <SkeletonGrid count={6} /> : null}
        {!loading && articles.length === 0 ? (
          <EmptyState
            title={t('common.noNewsForDate')}
            description="Latest available stories up to the selected date will appear here."
            actionLabel="Today's News"
            actionTo="/"
          />
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default HomePage;
