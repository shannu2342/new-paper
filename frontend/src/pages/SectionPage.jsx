import React, { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { api } from '../services/api.js';
import { useDate } from '../contexts/DateContext.jsx';
import { useTranslator } from '../i18n/useTranslator.js';

const titles = {
  amaravati: { te: 'అమరావతి', en: 'Amaravati', hi: 'अमरावती' },
  international: { te: 'అంతర్జాతీయం', en: 'International', hi: 'अंतरराष्ट्रीय' },
  national: { te: 'జాతీయ', en: 'National', hi: 'राष्ट्रीय' },
  editorial: { te: 'ఎడిటోరియల్', en: 'Editorial', hi: 'संपादकीय' },
  sports: { te: 'క్రీడలు', en: 'Sports', hi: 'खेल' },
  cinema: { te: 'సినిమా', en: 'Cinema', hi: 'सिनेमा' },
  special: { te: 'ప్రత్యేక', en: 'Special', hi: 'विशेष' },
  health: { te: 'ఆరోగ్యం', en: 'Health', hi: 'स्वास्थ्य' },
  women: { te: 'మహిళలు', en: 'Women', hi: 'महिलाएं' },
  devotional: { te: 'ధార్మికం', en: 'Devotional', hi: 'धार्मिक' },
  crime: { te: 'జناఅపరాధాలు', en: 'Crime', hi: 'अपराध' }
};

const SectionPage = ({ categoryType, subcategory }) => {
  const { language, t } = useTranslator();
  const { selectedDate } = useDate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    let url = `/articles?date=${selectedDate}&categoryType=${categoryType}`;
    if (subcategory) {
      url += `&otherCategoryKey=${subcategory}`;
    }
    api
      .get(url)
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
  }, [selectedDate, categoryType, subcategory]);

  const title = subcategory
    ? (titles[subcategory]?.[language] || titles[subcategory]?.en || titles[subcategory]?.te || t('sectionPage.fallbackTitle'))
    : (titles[categoryType]?.[language] || titles[categoryType]?.en || titles[categoryType]?.te || t('sectionPage.fallbackTitle'));

  return (
    <main className="page">
      <section className="page-header">
        <h1>{title}</h1>
      </section>
      <section className="article-grid">
        {loading ? <SkeletonGrid count={6} /> : null}
        {!loading && articles.length === 0 ? (
          <EmptyState
            title={t('common.noNewsForDate')}
            description="Try a different section or date."
            actionLabel="Back Home"
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

export default SectionPage;
