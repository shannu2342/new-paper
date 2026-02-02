import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { Link } from 'react-router-dom';

const HeroSlider = () => {
    const { language } = useLanguage();
    const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        console.log('Fetching hero images...');
        api.get('/hero-images')
            .then(data => {
                console.log('Hero images fetched:', data);
                setImages(data);
            })
            .catch(error => {
                console.error('Error fetching hero images:', error);
                setImages([]);
            });
    }, []);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    console.log('HeroSlider rendered with images:', images);

    if (images.length === 0) {
        console.log('No hero images, returning null');
        return (
            <div className="hero-slider">
                <div className="slider-container">
                    <div className="slider-slide active" style={{
                        backgroundImage: `url('https://picsum.photos/seed/default-hero/1200/600.jpg')`
                    }}>
                        <div className="slide-overlay"></div>
                        <div className="slide-content">
                            <h2 className="slide-title">{t('Welcome to Greater Today', 'గ్రేటర్ టోడే పలకు వస్తున్నాము', 'ग्रेटर टुडे में आपका स्वागत है')}</h2>
                        </div>
                    </div>
                    <div className="slider-indicators">
                        <button className="indicator active">
                            1
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <div className="hero-slider">
            <div className="slider-container">
                {images.map((image, index) => (
                    <div
                        key={image._id}
                        className={`slider-slide ${index === currentIndex ? 'active' : ''}`}
                        style={{
                            backgroundImage: `url(${image.imageUrl || 'https://picsum.photos/seed/hero-${index}/1200/600.jpg'})`
                        }}
                    >
                        <div className="slide-overlay"></div>
                        <div className="slide-content">
                            <h2 className="slide-title">{image.title[language]}</h2>
                            {image.articleId ? (
                                <Link
                                    to={`/articles/${image.articleId._id}`}
                                    className="slide-link"
                                >
                                    {t('Read More', 'వినండి', 'पढ़ें')}
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
