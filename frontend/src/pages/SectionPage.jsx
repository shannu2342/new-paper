import React, { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';

const titles = {
  amaravati: { te: 'అమరావతి', en: 'Amaravati', hi: 'अमरावती' },
  international: { te: 'అంతర్జాతీయం', en: 'International', hi: 'अंतरराष्ट्रीय' },
  national: { te: 'జాతీయ', en: 'National', hi: 'राष्ट्रीय' },
  sports: { te: 'క్రీడలు', en: 'Sports', hi: 'खेल' },
  cinema: { te: 'సినిమా', en: 'Cinema', hi: 'सिनेमा' }
};

const SectionPage = ({ categoryType }) => {
  const { language } = useLanguage();
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
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

  const title = titles[categoryType]?.[language] || titles[categoryType]?.en || titles[categoryType]?.te || t('News', 'వార్తలు', 'समाचार');

  return (
    <main className="page">
      <section className="page-header">
        <h1>{title}</h1>
      </section>
      <section className="article-grid">
        {loading ? <div className="empty">{t('Loading...', 'లోడ్ అవుతోంది...', 'लोड हो रहा है...')}</div> : null}
        {!loading && articles.length === 0 ? (
          <div className="empty">{t('No news for this date.', 'ఈ తేదీకి వార్తలు లేవు.', 'इस तारीख के लिए कोई समाचार नहीं है।')}</div>
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default SectionPage;
