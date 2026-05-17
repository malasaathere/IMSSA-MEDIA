import { createClient } from "@supabase/supabase-js";

// Custom storage adapter that falls back to memory if localStorage is blocked
const memoryStorage = {};
const safeStorage = {
  getItem: (key) => {
    try { return window.localStorage.getItem(key) || memoryStorage[key] || null; }
    catch (e) { return memoryStorage[key] || null; }
  },
  setItem: (key, value) => {
    try { window.localStorage.setItem(key, value); }
    catch (e) { memoryStorage[key] = value; }
  },
  removeItem: (key) => {
    try { window.localStorage.removeItem(key); }
    catch (e) { delete memoryStorage[key]; }
  }
};

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: safeStorage,
    },
  }
);
