import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use sessionStorage so the session is automatically cleared when the
// browser tab or window is closed — prevents stale session crashes on reopen
// and ensures users are always logged out when they close the app.
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'imssa-jwt-token',
        storage: window.sessionStorage, // sessionStorage clears on tab/browser close
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
