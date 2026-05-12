import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, mockUser } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
