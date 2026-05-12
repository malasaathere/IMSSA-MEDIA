import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, mockUser } from '../services/supabaseClient';
import { initGoogleClient, signInGoogle, signOutGoogle, getGoogleAuthStatus } from '../services/googleApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleInit, setGoogleInit] = useState(false);

  useEffect(() => {
    // Initialize Google API Client
    initGoogleClient((success) => {
      setGoogleInit(success);
      if (success) setGoogleConnected(getGoogleAuthStatus());
    });

    // Check local storage for persistent mock session during UI dev
    const savedUser = localStorage.getItem('evaluvate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto-login with mock user for testing if no one is logged in
      login(mockUser);
    }
    setLoading(false);

    // If using real supabase auth:
    /*
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
    */
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('evaluvate_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('evaluvate_user');
    // supabase.auth.signOut();
  };

  const switchRole = (role) => {
    const updatedUser = { ...user, role };
    login(updatedUser); // Just for testing UI roles
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
      user, login, logout, switchRole, loading, 
      googleConnected, handleGoogleSignIn, handleGoogleSignOut, googleInit 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
