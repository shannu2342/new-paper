const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('admin-token');
const clearToken = () => localStorage.removeItem('admin-token');

const redirectToAdminLogin = () => {
  if (typeof window === 'undefined') return;
  if (!window.location.pathname.startsWith('/admin')) return;
  if (window.location.pathname === '/admin/login') return;
  window.location.replace('/admin/login');
};

const request = async (path, options = {}) => {
  const headers = options.headers ? { ...options.headers } : {};
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs || 0);
  const timeoutId = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;
  if (options.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      cache: options.cache || 'no-store'
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
  if (timeoutId) clearTimeout(timeoutId);
  if (response.status === 401) {
    clearToken();
    redirectToAdminLogin();
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body, options) =>
    request(path, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' })
};

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  seed: (payload) => api.post('/auth/seed', payload),
  me: (options) => api.get('/auth/me', options),
  updateProfile: (payload, options) => api.put('/auth/profile', payload, options),
  changePassword: (payload, options) => api.put('/auth/change-password', payload, options)
};

export const notificationsApi = {
  publicKey: () => api.get('/notifications/public-key'),
  subscribe: (payload) => api.post('/notifications/subscribe', payload),
  broadcast: (payload, options) => api.post('/notifications/broadcast', payload, options)
};

export const analyticsApi = {
  track: (payload) => api.post('/analytics/track', payload),
  summary: (days = 30, options) => api.get(`/analytics/summary?days=${days}`, options)
};
