import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { formatArticleDateLabel } from '../utils/articleDate.js';

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const ArticleCard = ({ article, variant = 'default' }) => {
  const { language } = useLanguage();
  const title = article?.title?.[language] || article?.title?.en || article?.title?.te || article?.title?.hi;
  const rawSummary = article?.summary?.[language] || article?.summary?.en || article?.summary?.te || article?.summary?.hi;
  const rawContent = article?.content?.[language] || article?.content?.en || article?.content?.te || article?.content?.hi;
  const summary = stripHtml(rawSummary);
  const contentExcerpt = stripHtml(rawContent).slice(0, 220).trim();
  const previewText = summary || (contentExcerpt ? `${contentExcerpt}${stripHtml(rawContent).length > 220 ? '…' : ''}` : '');
  const cover = article?.images?.[0];

  return (
    <Link className={`article-card${variant === 'featured' ? ' article-card--featured' : ''}`} to={`/articles/${article._id}`}>
      {cover ? (
        <div className="article-card__media">
          <img src={cover} alt={title} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 320px" />
        </div>
      ) : null}
      <div className="article-card__content">
        <h3>{title}</h3>
        {previewText ? <p>{previewText}</p> : null}
        <span className="article-card__meta">{formatArticleDateLabel(article.dateKey, language)}</span>
      </div>
    </Link>
  );
};

export default ArticleCard;
