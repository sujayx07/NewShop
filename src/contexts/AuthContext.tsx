'use client';

import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'freelancer' | 'hirer' | null;

interface AuthContextType {
  session: Session | null;
  user: any | null;
  role: UserRole;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
  updateRole: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole((session?.user?.user_metadata?.current_role as UserRole) || null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole((session?.user?.user_metadata?.current_role as UserRole) || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const updateRole = async (newRole: UserRole) => {
    if (!user) return;
    
    try {
      // Update role in Supabase Auth user metadata
      const { error } = await supabase.auth.updateUser({
        data: { current_role: newRole },
      });
      
      if (error) throw error;
      
      // Removed attempt to update in users table as it may not exist or be accessible
      
      setRole(newRole);
    } catch (error) {
      console.error('Error updating role in auth:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, isLoading, signOut, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
