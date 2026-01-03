import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createSubscriber, getSubscriberByEmail } from '../services/sanity';
import { Subscriber } from '../types';

interface AuthContextType {
  user: User | null;
  subscriber: Subscriber | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase user with Sanity subscriber
  const syncSubscriber = async (supabaseUser: User) => {
    if (!supabaseUser.email) return;
    
    try {
      // Check if subscriber exists in Sanity
      let sub = await getSubscriberByEmail(supabaseUser.email);
      
      if (!sub) {
        // Create new subscriber in Sanity
        const name = supabaseUser.user_metadata?.full_name || 
                     supabaseUser.email.split('@')[0] || 
                     'Anonymous';
        sub = await createSubscriber(name, supabaseUser.email);
      }
      
      setSubscriber(sub);
    } catch (error) {
      console.error('Error syncing subscriber:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await syncSubscriber(session.user);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          await syncSubscriber(session.user);
        } else {
          setUser(null);
          setSubscriber(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with magic link
  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    
    return { error: error as Error | null };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSubscriber(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      subscriber,
      loading,
      signInWithEmail,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

