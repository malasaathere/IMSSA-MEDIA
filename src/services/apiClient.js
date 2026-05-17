import axios from 'axios';

// API calls go to /api/* on the same Vercel domain — no separate server needed
const api = axios.create({ baseURL: '/api' });

import { supabase } from './supabaseClient';

let currentToken = null;

export const setApiToken = (token) => {
  currentToken = token;
};

// Attach JWT to every request using the synchronized token
api.interceptors.request.use((config) => {
  if (currentToken) config.headers.Authorization = `Bearer ${currentToken}`;
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
