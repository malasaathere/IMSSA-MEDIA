import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Supabase Auth
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Sign out when the browser tab is closed (not on refresh)
    const handleTabClose = () => {
      supabase.auth.signOut();
    };
    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
    if (error) console.error("Error fetching profile:", error);
  };

  const loginWithUsername = async (username, password) => {
    // Look up email by username
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();
      
    if (error || !data) {
      throw new Error("Username not found");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: password,
    });
    
    if (signInError) throw signInError;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://imssa-media.vercel.app/reset-password'
    });
    if (error) throw error;
  };

  const register = async (email, password, username, name, whatsapp) => {
    // Check if username is taken first
    const { data } = await supabase.from('profiles').select('id').eq('username', username).single();
    if (data) throw new Error("Username is already taken.");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name, whatsapp_number: whatsapp },
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
  };

  const logout = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
      } else {
        console.log("Sign out successful.");
      }
      // Force user to null immediately in case the listener is slow
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Logout exception:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, login: loginWithUsername, register, resetPassword, logout, loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
