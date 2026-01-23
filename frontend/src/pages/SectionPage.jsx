import React, { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';

const titles = {
  amaravati: { te: 'అమరావతి', en: 'Amaravati' },
  international: { te: 'అంతర్జాతీయం', en: 'International' },
  national: { te: 'జాతీయ', en: 'National' },
  sports: { te: 'క్రీడలు', en: 'Sports' },
  cinema: { te: 'సినిమా', en: 'Cinema' }
};

const SectionPage = ({ categoryType }) => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
  const { selectedDate } = useDate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/articles?date=${selectedDate}&categoryType=${categoryType}`)
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
  }, [selectedDate, categoryType]);

  const title = titles[categoryType]?.[language] || titles[categoryType]?.en || titles[categoryType]?.te || 'News';

  return (
    <main className="page">
      <section className="page-header">
        <h1>{title}</h1>
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

export default SectionPage;
