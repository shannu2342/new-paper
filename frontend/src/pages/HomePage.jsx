import React, { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import BreakingTicker from '../components/BreakingTicker.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { api } from '../services/api.js';
import { useDate } from '../contexts/DateContext.jsx';
import { todayInput } from '../utils/date.js';
import { useTranslator } from '../i18n/useTranslator.js';

const HomePage = () => {
  const { t } = useTranslator();
  const { selectedDate } = useDate();
  const isPreviousEdition = selectedDate !== todayInput();
  const [articles, setArticles] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/articles?date=${selectedDate}&categoryType=home`)
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
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    api
      .get(`/articles?date=${selectedDate}&categoryType=home&isBreaking=true&limit=10`)
      .then((data) => {
        if (active) setBreaking(data);
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
    api
      .get(`/articles?date=${selectedDate}&categoryType=home&isFeatured=true&limit=1`)
      .then((data) => {
        if (active) setFeatured(data[0] || null);
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
    api
      .get(`/articles?date=${selectedDate}&categoryType=home&limit=8`)
      .then((data) => {
        if (active) setLatest(data);
      })
      .catch(() => {
        if (active) setLatest([]);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

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
            <ArticleCard article={featured} />
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
            description="Choose another date or return to today's edition."
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
