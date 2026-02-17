import React, { useEffect, useMemo, useState } from 'react';
import ArticleCard from '../components/ArticleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';
import { api } from '../services/api.js';
import { useDate } from '../contexts/DateContext.jsx';
import { partitions, districtsByPartition } from '../utils/apData.js';
import { useTranslator } from '../i18n/useTranslator.js';

const ApPage = () => {
  const { t } = useTranslator();
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
        <h1>{t('apPage.title')}</h1>
      </section>
      <section className="filters">
        <label>
          {t('apPage.selectRegion')}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedDistrict('');
            }}
          >
            <option value="">{t('common.select')}</option>
            {partitions.map((partition) => (
              <option key={partition.code} value={partition.code}>
                {partition.name}
              </option>
            ))}
          </select>
        </label>
        {selectedRegion ? (
          <label>
            {t('apPage.selectDistrict')}
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
              <option value="">{t('common.select')}</option>
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
          <EmptyState
            title={t('apPage.pickDistrictPrompt')}
            description="Choose region and district to load localized news."
          />
        ) : null}
        {selectedDistrict && loading ? (
          <SkeletonGrid count={4} />
        ) : null}
        {selectedDistrict && !loading && articles.length === 0 ? (
          <EmptyState title={t('common.noNewsForDate')} description="Try another district or date." />
        ) : null}
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </section>
    </main>
  );
};

export default ApPage;
