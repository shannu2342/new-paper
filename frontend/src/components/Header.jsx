import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useDate } from '../contexts/DateContext.jsx';
import Logo from './Logo.jsx';

const fallbackItems = [
  { key: 'home', title: { te: 'హోమ్', en: 'Home' }, order: 0, path: '/' },
  { key: 'amaravati', title: { te: 'అమరావతి', en: 'Amaravati' }, order: 1, path: '/amaravati' },
  { key: 'ap', title: { te: 'ఆంధ్రప్రదేశ్', en: 'Andhra Pradesh' }, order: 2, path: '/ap' },
  { key: 'international', title: { te: 'అంతర్జాతీయం', en: 'International' }, order: 3, path: '/international' },
  { key: 'national', title: { te: 'జాతీయ', en: 'National' }, order: 4, path: '/national' },
  { key: 'sports', title: { te: 'క్రీడలు', en: 'Sports' }, order: 5, path: '/sports' },
  { key: 'cinema', title: { te: 'సినిమా', en: 'Cinema' }, order: 6, path: '/cinema' },
  { key: 'other', title: { te: 'ఇతరాలు', en: 'Other' }, order: 7, path: '/other' }
];

const routeMap = {
  home: '/',
  amaravati: '/amaravati',
  ap: '/ap',
  international: '/international',
  national: '/national',
  sports: '/sports',
  cinema: '/cinema',
  other: '/other'
};

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { selectedDate } = useDate();
  const [items, setItems] = useState(fallbackItems);
  const isTelugu = language === 'te';

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
        if (mapped.length === 8) {
          setItems(mapped);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="site-header">
      <div className="header-row">
        <div className="brand">
          <Logo />
          <div className="brand-text">
            Greater Today
            <span className="brand-sub">తెలుగు-ఫస్ట్ న్యూస్</span>
          </div>
          <span className="edition-date">
            {isTelugu ? 'సంచిక' : 'Edition'}: {selectedDate}
          </span>
        </div>
        <nav className="nav-links">
          {items.map((item) => (
            <NavLink key={item.key} to={item.path} className="nav-link">
              {item.title?.[language] || item.title?.en || item.title?.te}
            </NavLink>
          ))}
        </nav>
        <div className="social-links">
          <a className="social-icon" href="#" aria-label="Facebook" title="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.6V12h2.6V9.8c0-2.6 1.6-4 3.9-4 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
            </svg>
          </a>
          <a className="social-icon" href="#" aria-label="Instagram" title="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zm5.2-2.7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
            </svg>
          </a>
          <a className="social-icon" href="#" aria-label="Twitter" title="Twitter">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.2 3H21l-6.6 7.5L22 21h-6.1l-4.8-6.2L5.7 21H3l7.1-8.1L2 3h6.2l4.3 5.7L18.2 3zm-1.1 16h1.7L6.9 5H5.1l12 14z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="header-lower">
        <div className="language-select">
          <label htmlFor="language">
            {isTelugu ? 'భాష' : 'Language'}
          </label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="en">English</option>
            <option value="as">Assamese</option>
            <option value="bn">Bengali</option>
            <option value="brx">Bodo</option>
            <option value="doi">Dogri</option>
            <option value="gu">Gujarati</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
            <option value="ks">Kashmiri</option>
            <option value="kok">Konkani</option>
            <option value="mai">Maithili</option>
            <option value="ml">Malayalam</option>
            <option value="mni">Meitei (Manipuri)</option>
            <option value="mr">Marathi</option>
            <option value="ne">Nepali</option>
            <option value="or">Odia</option>
            <option value="pa">Punjabi</option>
            <option value="sa">Sanskrit</option>
            <option value="sat">Santali</option>
            <option value="sd">Sindhi</option>
            <option value="ta">Tamil</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
