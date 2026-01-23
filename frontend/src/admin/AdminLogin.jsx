import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api.js';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login({ username, password });
      localStorage.setItem('admin-token', token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'లాగిన్ విఫలమైంది');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page admin-page">
      <h1>Admin Login (అడ్మిన్ లాగిన్)</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Username (వినియోగదారు పేరు)
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password (పాస్వర్డ్)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </button>
      </form>
    </main>
  );
};

export default AdminLogin;
