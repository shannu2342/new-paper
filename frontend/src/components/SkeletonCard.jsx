import React from 'react';

export const SkeletonCard = () => (
  <div className="article-card skeleton-card" aria-hidden="true">
    <div className="skeleton skeleton-media" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line skeleton-line--short" />
    <div className="skeleton skeleton-meta" />
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </>
);
