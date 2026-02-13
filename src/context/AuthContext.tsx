'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user credentials - In production, this would be handled by a backend
const MOCK_CREDENTIALS = [
  // Super Admins
  { 
    email: 'sarah.s@abbeconsult.com', 
    password: 'admin123',
    user: { id: 'admin1', name: 'Sarah Smith', email: 'sarah.s@abbeconsult.com', role: 'Super Admin', avatar: 'SS' }
  },
  { 
    email: 'alex.p@abbe.com', 
    password: 'admin123',
    user: { id: 'admin2', name: 'Alexander Pierce', email: 'alex.p@abbe.com', role: 'Super Admin', avatar: 'AP' }
  },
  // Admin (Generic)
  { 
    email: 'victoria.h@abbeconsult.com', 
    password: 'admin123',
    user: { id: 'admin3', name: 'Victoria Hand', email: 'victoria.h@abbeconsult.com', role: 'Admin', avatar: 'VH' }
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const credential = MOCK_CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );

    if (credential) {
      setUser(credential.user);
      localStorage.setItem('authUser', JSON.stringify(credential.user));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
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
