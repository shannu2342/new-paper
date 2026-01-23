import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const fallback = {
  address: { en: 'Your address here', te: 'మీ చిరునామా ఇక్కడ' },
  contact: { en: 'Contact details', te: 'సంప్రదింపు వివరాలు' },
  phone: '',
  email: ''
};

const Footer = () => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
  const [settings, setSettings] = useState(fallback);

  useEffect(() => {
    api
      .get('/site-settings')
      .then((data) => setSettings(data))
      .catch(() => setSettings(fallback));
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-block">
        <h3>{isTelugu ? 'చిరునామా' : 'Address'}</h3>
        <p>{settings.address?.[language] || settings.address?.en || settings.address?.te}</p>
      </div>
      <div className="footer-block">
        <h3>{isTelugu ? 'సంప్రదింపు' : 'Contact'}</h3>
        <p>{settings.contact?.[language] || settings.contact?.en || settings.contact?.te}</p>
        {settings.phone ? (
          <p>{isTelugu ? 'ఫోన్' : 'Phone'}: {settings.phone}</p>
        ) : null}
        {settings.email ? (
          <p>{isTelugu ? 'ఇమెయిల్' : 'Email'}: {settings.email}</p>
        ) : null}
      </div>
      <div className="footer-bottom">
        <span>© 2026 Telugu-First News. All Rights Reserved.</span>
        <span className="footer-meta">Regd No. 55/2021 · Vijayawada, Andhra Pradesh</span>
        <Link className="admin-link" to="/admin">Admin Login</Link>
      </div>
    </footer>
  );
};

export default Footer;
