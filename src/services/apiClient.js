import axios from 'axios';

// API calls go to /api/* on the same Vercel domain — no separate server needed
const api = axios.create({ baseURL: '/api' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imssa-access-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('imssa-refresh-token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth', { action: 'refresh', refresh_token: refreshToken });
          localStorage.setItem('imssa-access-token', data.access_token);
          localStorage.setItem('imssa-refresh-token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem('imssa-access-token');
          localStorage.removeItem('imssa-refresh-token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
