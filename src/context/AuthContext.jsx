import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../config/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        // First check localStorage for offline/local auth
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (isLoggedIn && userData) {
          setUser(userData);
          setLoading(false);
          return;
        }

        // If no local auth, check Supabase
        if (!supabase) {
          console.error('Supabase client not initialized');
          setLoading(false);
          return;
        }
        
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          try {
            await supabase.rpc('set_current_user_id', {
              user_id: authUser.id
            });
          } catch (rpcError) {
            console.error('Error setting current user ID:', rpcError);
          }
          
          setUser(authUser);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    if (supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          await supabase.rpc('set_current_user_id', {
            user_id: session.user.id
          });
        } catch (rpcError) {
          console.error('Error setting current user ID:', rpcError);
        }
        
        setUser(session.user);
        } else {
          // Check localStorage before setting user to null
          const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          
          if (isLoggedIn && userData) {
            setUser(userData);
      } else {
        setUser(null);
          }
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Clear local storage
      localStorage.clear();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;