import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
// We only initialize if the variables are present to avoid app crashing during initial UI development
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock user for UI development before actual Supabase connection
export const mockUser = {
  id: 'mock-user-1',
  email: 'admin@evaluvate.com',
  role: 'admin', // can be 'admin', 'member', 'viewer'
  name: 'Admin User'
};
