import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { initGoogleClient, signInGoogle, signOutGoogle, getGoogleAuthStatus } from '../services/googleApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleInit, setGoogleInit] = useState(false);

  useEffect(() => {
    // Initialize Google API Client
    initGoogleClient((success) => {
      setGoogleInit(success);
      if (success) setGoogleConnected(getGoogleAuthStatus());
    });

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

    return () => subscription.unsubscribe();
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

  const register = async (email, password, username, name, whatsapp) => {
    // Check if username is taken first
    const { data } = await supabase.from('profiles').select('id').eq('username', username).single();
    if (data) throw new Error("Username is already taken.");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name, whatsapp_number: whatsapp }
      }
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const handleGoogleSignIn = async () => {
    try {
      const gUser = await signInGoogle();
      if (gUser) setGoogleConnected(true);
    } catch (err) {
      console.error("Google Sign In Failed", err);
    }
  };

  const handleGoogleSignOut = () => {
    signOutGoogle();
    setGoogleConnected(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, login: loginWithUsername, register, logout, loading, 
      googleConnected, handleGoogleSignIn, handleGoogleSignOut, googleInit 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
