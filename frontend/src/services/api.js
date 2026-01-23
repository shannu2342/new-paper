const API_URL = import.meta.env.VITE_API_URL || 'https://new-paper.onrender.com/api';

const getToken = () => localStorage.getItem('admin-token');

const request = async (path, options = {}) => {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });
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
  del: (path, options) => request(path, { ...options, method: 'DELETE' })
};

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  seed: (payload) => api.post('/auth/seed', payload)
};
