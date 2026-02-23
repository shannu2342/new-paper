import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const ArticleCard = ({ article }) => {
  const { language } = useLanguage();
  const title = article?.title?.[language] || article?.title?.en || article?.title?.te;
  const rawSummary = article?.summary?.[language] || article?.summary?.en || article?.summary?.te;
  const summary = rawSummary ? rawSummary.replace(/<[^>]*>/g, '').trim() : '';
  const cover = article?.images?.[0];

  return (
    <Link className="article-card" to={`/articles/${article._id}`}>
      {cover ? (
        <div className="article-card__media">
          <img src={cover} alt={title} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 320px" />
        </div>
      ) : null}
      <div className="article-card__content">
        <h3>{title}</h3>
        {summary ? <p>{summary}</p> : null}
        <span className="article-card__meta">{article.dateKey}</span>
      </div>
    </Link>
  );
};

export default ArticleCard;
