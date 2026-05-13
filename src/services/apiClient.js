import axios from 'axios';

// API calls go to /api/* on the same Vercel domain — no separate server needed
const api = axios.create({ baseURL: '/api' });

import { supabase } from './supabaseClient';

// Attach JWT to every request using Supabase SDK session
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the API returns 401 Unauthorized, force a logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
