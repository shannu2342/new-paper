import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';

const DistrictPage = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const isTelugu = language === 'te';
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
        <h1>{isTelugu ? 'జిల్లా వార్తలు' : 'District News'}</h1>
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

export default DistrictPage;
