import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useTranslator } from '../i18n/useTranslator.js';

const HeroSlider = () => {
  const { language, t } = useTranslator();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api
      .get('/hero-images')
      .then(setImages)
      .catch(() => setImages([]));
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="hero-slider">
        <div className="slider-container">
          <div
            className="slider-slide active"
            style={{ backgroundImage: "url('https://picsum.photos/seed/default-hero/1200/600.jpg')" }}
          >
            <div className="slide-overlay" />
            <div className="slide-content">
              <h2 className="slide-title">{t('heroSlider.welcomeTitle')}</h2>
            </div>
          </div>
          <div className="slider-indicators">
            <button className="indicator active">1</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-slider">
      <div className="slider-container">
        {images.map((image, index) => (
          <div
            key={image._id}
            className={`slider-slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${image.imageUrl || `https://picsum.photos/seed/hero-${index}/1200/600.jpg`})`
            }}
          >
            <div className="slide-overlay" />
            <div className="slide-content">
              <h2 className="slide-title">{image.title?.[language] || image.title?.en || image.title?.te}</h2>
              {image.articleId ? (
                <Link to={`/articles/${image.articleId._id}`} className="slide-link">
                  {t('heroSlider.readMore')}
                </Link>
              ) : null}
            </div>
          </div>
        ))}

        <div className="slider-controls">
          <button
            className="slider-button prev"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            className="slider-button next"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>

        <div className="slider-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
