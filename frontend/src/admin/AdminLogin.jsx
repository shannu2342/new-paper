import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api.js';
import { useTranslator } from '../i18n/useTranslator.js';

const AdminLogin = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { t } = useTranslator();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin-token')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login({ username, password });
      localStorage.setItem('admin-token', token);
      if (onSuccess) {
        onSuccess();
      }
      navigate('/admin');
    } catch (err) {
      const msg = err.message && err.message.toLowerCase().includes('fetch')
        ? t('admin.apiNotReachable')
        : err.message;
      setError(msg || t('admin.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setError('');
    setSeeding(true);
    try {
      const { token } = await authApi.seed({ username: 'admin', password: 'admin123' });
      localStorage.setItem('admin-token', token);
      if (onSuccess) {
        onSuccess();
      }
      navigate('/admin');
    } catch (err) {
      const msg = err.message && err.message.toLowerCase().includes('fetch')
        ? t('admin.apiNotReachable')
        : err.message;
      setError(msg || t('admin.seedFailed'));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="page admin-page">
      <h1>{t('admin.loginTitle')}</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          {t('admin.username')}
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          {t('admin.password')}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <button type="submit" disabled={loading}>
          {loading ? t('admin.pleaseWait') : t('admin.login')}
        </button>
        <button type="button" className="secondary" onClick={handleSeed} disabled={seeding}>
          {seeding ? t('admin.creatingAdmin') : t('admin.createAdmin')}
        </button>
      </form>
    </main>
  );
};

export default AdminLogin;
