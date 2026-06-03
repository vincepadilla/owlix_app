import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const response = await supabase.auth.signUp({ email, password });
    if (response && response.error) throw response.error;
  };

  const signIn = async (email, password) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    if (response && response.error) throw response.error;
  };

  const signOut = async () => {
    const response = await supabase.auth.signOut();
    if (response && response.error) {
      // If the server-side logout fails (e.g., the 100KB 520 error), 
      // forcefully clear the local session so the user isn't trapped.
      console.warn('Server signout failed, forcing local signout:', response.error.message);
      await supabase.auth.signOut({ scope: 'local' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
