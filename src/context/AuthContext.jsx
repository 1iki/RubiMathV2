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
        if (!supabase) {
          console.error('Supabase client not initialized');
          setLoading(false);
          return;
        }
        
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Set the app.current_user_id for RLS policies
          try {
            await supabase.rpc('set_current_user_id', {
              user_id: authUser.id
            });
          } catch (rpcError) {
            console.error('Error setting current user ID:', rpcError);
            // Continue anyway
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

    if (!supabase) {
      console.error('Supabase client not initialized');
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Set the app.current_user_id for RLS policies
        try {
          await supabase.rpc('set_current_user_id', {
            user_id: session.user.id
          });
        } catch (rpcError) {
          console.error('Error setting current user ID:', rpcError);
          // Continue anyway
        }
        
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    checkUser();

    return () => {
      subscription?.unsubscribe();
    };
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
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage data
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