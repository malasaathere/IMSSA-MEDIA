import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// localStorage keeps session alive on page refresh.
// A beforeunload listener in AuthContext handles tab-close logout.
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'imssa-jwt-token',
        storage: window.localStorage,
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
