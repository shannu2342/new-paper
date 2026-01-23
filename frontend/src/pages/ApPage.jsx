import React, { useEffect, useMemo, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';
import { partitions, districtsByPartition } from '../utils/apData.js';

const ApPage = () => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
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
        <h1>{isTelugu ? 'ఆంధ్రప్రదేశ్' : 'Andhra Pradesh'}</h1>
      </section>
      <section className="filters">
        <label>
          {isTelugu ? 'ప్రాంతం' : 'Select Region'}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedDistrict('');
            }}
          >
            <option value="">{isTelugu ? 'ఎంచుకోండి' : 'Select'}</option>
            {partitions.map((partition) => (
              <option key={partition.code} value={partition.code}>
                {partition.name}
              </option>
            ))}
          </select>
        </label>
        {selectedRegion ? (
          <label>
            {isTelugu ? 'జిల్లా' : 'Select District'}
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
              <option value="">{isTelugu ? 'ఎంచుకోండి' : 'Select'}</option>
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
          <div className="empty">{isTelugu ? 'ముందు జిల్లా ఎంచుకోండి.' : 'Please select a district to view news.'}</div>
        ) : null}
        {selectedDistrict && loading ? (
          <div className="empty">{isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...'}</div>
        ) : null}
        {selectedDistrict && !loading && articles.length === 0 ? (
          <div className="empty">{isTelugu ? 'ఈ తేదీకి వార్తలు లేవు.' : 'No news for this date.'}</div>
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default ApPage;
