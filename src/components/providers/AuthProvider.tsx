'use client';

/**
 * AuthProvider — Supabase Authentication Context
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AppUser } from '@/types';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  appUser: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Sync Supabase Auth with custom users table
    const syncUser = async (sessionUser: User | null) => {
      if (!sessionUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      // Check if user exists in the public.users table
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (existingUser) {
        setAppUser(existingUser as AppUser);
      } else {
        // Create new user record
        const newUser: AppUser = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          displayName: sessionUser.user_metadata?.full_name || undefined,
          photoURL: sessionUser.user_metadata?.avatar_url || undefined,
          role: 'client',
          freeCreditsUsed: 0,
          createdAt: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('users').insert(newUser);
        
        if (!insertError) {
          setAppUser(newUser);
        } else {
          console.error('Error creating user record:', insertError);
        }
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const logOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ appUser, loading, signIn, signUp, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
