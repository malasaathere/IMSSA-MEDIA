import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import api, { setApiToken } from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          // Bad session — clear it instead of crashing
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setApiToken(null);
        } else {
          setUser(data.session?.user ?? null);
          setApiToken(data.session?.access_token ?? null);
          if (data.session?.user) {
            await fetchProfile(data.session.user.id);
          }
        }
      } catch (err) {
        console.error('Session fetch crashed:', err);
        await supabase.auth.signOut();
        setUser(null);
        setApiToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Safety fallback: if Supabase hangs for any reason, force unblock after 3 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn("AuthContext safety timeout triggered! Supabase hung.");
      setLoading(false);
    }, 3000);

    fetchSessionAndProfile().then(() => clearTimeout(safetyTimeout));

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setApiToken(session?.access_token ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    // Logout when browser tab is closed
    const handleTabClose = () => { supabase.auth.signOut(); };
    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      if (listener?.subscription) listener.subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
    if (error) console.error('Profile fetch error:', error);
  };

  // LOGIN via Node.js API → set session in Supabase client for auth tracking
  const loginWithUsername = async (username, password) => {
    const { data } = await api.post('/auth', { action: 'login', username, password });
    // Set the session in the Supabase client so onAuthStateChange fires
    await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });
  };

  // REGISTER via Node.js API
  const register = async (email, password, username, name, whatsapp) => {
    await api.post('/auth', { action: 'register', email, password, username, name, whatsapp });
  };

  // FORGOT PASSWORD via Node.js API (uses Nodemailer)
  const resetPassword = async (email) => {
    const { data } = await api.post('/auth', { action: 'forgot-password', email });
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, login: loginWithUsername, register, resetPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
