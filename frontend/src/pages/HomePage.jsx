import React, { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import BreakingTicker from '../components/BreakingTicker.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';
import { todayInput } from '../utils/date.js';

const HomePage = () => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
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
          {isTelugu ? 'పాత సంచిక:' : 'Previous Edition:'} {selectedDate}
        </div>
      ) : null}
      <BreakingTicker items={breaking} />
      <section className="page-header">
        <h1>{isTelugu ? 'హోమ్ వార్తలు' : 'Home News'}</h1>
      </section>
      <section className="home-featured">
        <div className="featured-card">
          <h2>{isTelugu ? 'ప్రధాన వార్త' : 'Featured Story'}</h2>
          {featured ? (
            <ArticleCard article={featured} />
          ) : (
            <div className="empty">{isTelugu ? 'ప్రధాన వార్త లేదు.' : 'No featured story yet.'}</div>
          )}
        </div>
        <div className="latest-list">
          <h2>{isTelugu ? 'తాజా వార్తలు' : 'Latest Updates'}</h2>
          {latest.length === 0 ? (
            <div className="empty">{isTelugu ? 'తాజా వార్తలు లేవు.' : 'No latest updates.'}</div>
          ) : (
            latest.map((item) => <ArticleCard key={item._id} article={item} />)
          )}
        </div>
      </section>
      <section className="article-grid">
        {loading ? <div className="empty">{isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...'}</div> : null}
        {!loading && articles.length === 0 ? (
          <div className="empty">{isTelugu ? 'ఈ తేదీకి వార్తలు లేవు.' : 'No news for this date.'}</div>
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default HomePage;
