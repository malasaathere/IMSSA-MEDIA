import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
// Enforcing Local Storage for JWTs to ensure no cookies are used for authentication
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'imssa-jwt-token', // Explicitly naming the JWT token
        storage: window.localStorage, // Force local storage instead of cookies
        autoRefreshToken: true,
      }
    })
  : null;

// Mock user for UI development before actual Supabase connection
export const mockUser = {
  id: 'mock-user-1',
  email: 'admin@evaluvate.com',
  role: 'admin', // can be 'admin', 'member', 'viewer'
  name: 'Admin User'
};
