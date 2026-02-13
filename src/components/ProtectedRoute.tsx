'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to login page
    if (pathname === '/login') {
      if (isAuthenticated) {
        router.push('/dashboard');
      }
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasRole(allowedRoles)) {
        router.push('/dashboard'); // Redirect to dashboard if no access
      }
    }
  }, [isAuthenticated, hasRole, router, pathname, allowedRoles]);

  // Show nothing while checking authentication
  if (pathname !== '/login' && !isAuthenticated) {
    return null;
  }

  // Show nothing if user doesn't have required role
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
