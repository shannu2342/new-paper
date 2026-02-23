import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useTranslator } from '../i18n/useTranslator.js';

const fallback = {
  regdOffice: {
    en: '#31-27-31/1, Kurmanapalem, Vadlapudi (Post), Visakhapatnam, Andhra Pradesh - 530046',
    te: '#31-27-31/1, Kurmanapalem, Vadlapudi (Post), Visakhapatnam, Andhra Pradesh - 530046'
  },
  stateOffice: {
    en: 'DNo: 26-3-134, Gandhinarar, NRP Road, Vijayawada, NTR Dist., Amaravati, Andhra Pradesh - 520003',
    te: 'DNo: 26-3-134, Gandhinarar, NRP Road, Vijayawada, NTR Dist., Amaravati, Andhra Pradesh - 520003'
  },
  contact: { en: 'Contact details', te: 'సంప్రదింపు వివరాలు' },
  phone: '',
  email: ''
};

const Footer = () => {
  const { language, t } = useTranslator();
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
        <h3>{t('footer.regdOffice')}</h3>
        <p>{settings.regdOffice?.[language] || settings.regdOffice?.en || settings.regdOffice?.te}</p>
      </div>
      <div className="footer-block">
        <h3>{t('footer.stateOffice')}</h3>
        <p>{settings.stateOffice?.[language] || settings.stateOffice?.en || settings.stateOffice?.te}</p>
      </div>
      <div className="footer-block">
        <h3>{t('footer.contact')}</h3>
        <p>{settings.contact?.[language] || settings.contact?.en || settings.contact?.te}</p>
        {settings.phone ? (
          <p>{t('footer.phone')}: {settings.phone}</p>
        ) : null}
        {settings.email ? (
          <p>{t('footer.email')}: {settings.email}</p>
        ) : null}
      </div>
      <div className="footer-bottom">
        <span>© 2026 Telugu-First News. All Rights Reserved.</span>
        <div className="footer-social">
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
    </footer>
  );
};

export default Footer;
