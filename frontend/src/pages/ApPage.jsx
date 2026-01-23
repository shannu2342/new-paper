import React, { useEffect, useMemo, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';
import { partitions, districtsByPartition } from '../utils/apData.js';

const ApPage = () => {
  const { language } = useLanguage();
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
  const { selectedDate } = useDate();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const districtOptions = useMemo(
    () => (selectedRegion ? districtsByPartition[selectedRegion] || [] : []),
    [selectedRegion]
  );

  useEffect(() => {
    let active = true;
    if (!selectedDistrict) {
      setArticles([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      section: 'AP',
      partition: selectedRegion,
      district: selectedDistrict,
      date: selectedDate
    });
    api
      .get(`/news?${params.toString()}`)
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
  }, [selectedDate, selectedRegion, selectedDistrict]);

  return (
    <main className="page">
      <section className="page-header">
        <h1>{t('Andhra Pradesh', 'ఆంధ్రప్రదేశ్', 'आंध्र प्रदेश')}</h1>
      </section>
      <section className="filters">
        <label>
          {t('Select Region', 'ప్రాంతం', 'क्षेत्र चुनें')}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedDistrict('');
            }}
          >
            <option value="">{t('Select', 'ఎంచుకోండి', 'चुनें')}</option>
            {partitions.map((partition) => (
              <option key={partition.code} value={partition.code}>
                {partition.name}
              </option>
            ))}
          </select>
        </label>
        {selectedRegion ? (
          <label>
            {t('Select District', 'జిల్లా', 'जिला चुनें')}
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
              <option value="">{t('Select', 'ఎంచుకోండి', 'चुनें')}</option>
              {districtOptions.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>
      <section className="article-grid">
        {!selectedDistrict ? (
          <div className="empty">
            {t('Please select a district to view news.', 'ముందు జిల్లా ఎంచుకోండి.', 'कृपया समाचार देखने के लिए जिला चुनें।')}
          </div>
        ) : null}
        {selectedDistrict && loading ? (
          <div className="empty">{t('Loading...', 'లోడ్ అవుతోంది...', 'लोड हो रहा है...')}</div>
        ) : null}
        {selectedDistrict && !loading && articles.length === 0 ? (
          <div className="empty">{t('No news for this date.', 'ఈ తేదీకి వార్తలు లేవు.', 'इस तारीख के लिए कोई समाचार नहीं है।')}</div>
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default ApPage;
