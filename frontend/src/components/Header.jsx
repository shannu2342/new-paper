import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Logo from './Logo.jsx';

const fallbackItems = [
  { key: 'home', title: { te: 'హోమ్', en: 'Home' }, order: 0, path: '/' },
  { key: 'amaravati', title: { te: 'అమరావతి', en: 'Amaravati' }, order: 1, path: '/amaravati' },
  { key: 'ap', title: { te: 'ఆంధ్రప్రదేశ్', en: 'Andhra Pradesh' }, order: 2, path: '/ap' },
  { key: 'international', title: { te: 'అంతర్జాతీయం', en: 'International' }, order: 3, path: '/international' },
  { key: 'national', title: { te: 'జాతీయ', en: 'National' }, order: 4, path: '/national' },
  { key: 'editorial', title: { te: 'ఎడిటోరియल్', en: 'Editorial' }, order: 5, path: '/editorial' },
  { key: 'sports', title: { te: 'క్రీడలు', en: 'Sports' }, order: 6, path: '/sports' },
  { key: 'cinema', title: { te: 'సినిమా', en: 'Cinema' }, order: 7, path: '/cinema' },
  { key: 'special', title: { te: 'ప్రత్యేక', en: 'Special' }, order: 8, path: '/special' },
  { key: 'other', title: { te: 'ఇతరాలు', en: 'Other' }, order: 9, path: '/other' }
];

const routeMap = {
  home: '/',
  amaravati: '/amaravati',
  ap: '/ap',
  international: '/international',
  national: '/national',
  editorial: '/editorial',
  sports: '/sports',
  cinema: '/cinema',
  special: '/special',
  other: '/other',
  epaper: '/epaper'
};

const hindiNavLabels = {
  home: 'होम',
  amaravati: 'अमरावती',
  ap: 'आंध्र प्रदेश',
  international: 'अंतरराष्ट्रीय',
  national: 'राष्ट्रीय',
  editorial: 'संपादकीय',
  sports: 'खेल',
  cinema: 'सिनेमा',
  special: 'विशेष',
  other: 'अन्य',
  epaper: 'ई-पेपर'
};

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const [items, setItems] = useState(fallbackItems);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = (en, te, hi = en) => (language === 'te' ? te : language === 'hi' ? hi : en);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    let active = true;
    api
      .get('/menu-settings')
      .then((data) => {
        if (!active) return;
        const mapped = (data.headerItems || [])
          .map((item) => ({
            ...item,
            path: routeMap[item.key]
          }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (mapped.length === 11) {
          setItems(mapped);
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="site-header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="top-left">
          <div className="date">{currentDate}</div>
          <div className="e-paper e-paper--mobile">
            <NavLink to="/epaper">{t('E-Paper', 'ఇ-పేపర్', 'ई-पेपर')}</NavLink>
          </div>
        </div>
        <div className="top-center">
          <div className="brand">
            <Logo />
            <div className="brand-text">
              Greater Today
              <span className="brand-sub">{t('Greater Today News', 'గ్రేటర్ టుడే న్యూస్', 'ग्रेटर टुडे समाचार')}</span>
            </div>
          </div>
        </div>
        <div className="top-right">
          <div className="e-paper e-paper--desktop">
            <NavLink to="/epaper">{t('E-Paper', 'ఇ-పేపర్', 'ई-पेपर')}</NavLink>
          </div>
          <div className="language-select">
            <select
              id="language"
              aria-label="Select language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen ? 'true' : 'false'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="header-nav">
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {items.map((item) => (
            <NavLink key={item.key} to={item.path} className="nav-link" onClick={() => setMenuOpen(false)}>
              {language === 'hi'
                ? hindiNavLabels[item.key] || item.title?.en || item.title?.te
                : item.title?.[language] || item.title?.en || item.title?.te}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
