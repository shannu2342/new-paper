import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useTranslator } from '../i18n/useTranslator.js';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonGrid } from '../components/SkeletonCard.jsx';

const ArticlePage = () => {
  const { id } = useParams();
  const { language, t } = useTranslator();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/articles/${id}`)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <section className="article-grid">
          <SkeletonGrid count={1} />
        </section>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="page">
        <EmptyState title={t('articlePage.notFound')} description="Go back and explore latest stories." actionLabel="Home" actionTo="/" />
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
              <img key={img} src={img} alt={title} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 50vw" />
            ))}
          </div>
        ) : null}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: content || '' }} />
      </article>
    </main>
  );
};

export default ArticlePage;
