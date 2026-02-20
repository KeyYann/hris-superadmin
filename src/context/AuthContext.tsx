'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  departmentId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Allowed email domains
const ALLOWED_DOMAINS = ['abbeconsult.com', 'abbe.com', 'bequik.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          avatar,
          department_id,
          roles (name)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const role = Array.isArray(data.roles) ? data.roles[0] : data.roles;
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: role?.name || 'Employee',
          avatar: data.avatar,
          departmentId: data.department_id
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate email domain
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
        return { 
          success: false, 
          error: 'Email must be from abbeconsult.com, abbe.com, or bequik.com' 
        };
      }

      // Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (error) {
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }

      if (data.user) {
        await loadUserData(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
