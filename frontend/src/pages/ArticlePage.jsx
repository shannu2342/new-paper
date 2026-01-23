import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const ArticlePage = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    api.get(`/articles/${id}`).then(setArticle).catch(() => setArticle(null));
  }, [id]);

  if (!article) {
    return (
      <main className="page">
        <div className="empty">{t('Article not found.', 'వార్త కనబడలేదు.', 'लेख नहीं मिला।')}</div>
      </main>
    );
  }

  const title = article.title?.[language] || article.title?.en || article.title?.te;
  const content = article.content?.[language] || article.content?.en || article.content?.te;

  return (
    <main className="page">
      <article className="article-detail">
        <h1>{title}</h1>
        <div className="article-meta">{article.dateKey}</div>
        {article.images?.length ? (
          <div className="article-gallery">
            {article.images.map((img) => (
              <img key={img} src={img} alt={title} />
            ))}
          </div>
        ) : null}
        <div className="article-body">{content}</div>
      </article>
    </main>
  );
};

export default ArticlePage;
