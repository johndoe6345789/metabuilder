/**
 * Client-side route guard -- redirects to /login when the (redux-persist
 * rehydrated) auth state has no valid session. Workflowui has no
 * server-side middleware auth check, so this is the only gate; it's skipped
 * on the auth routes themselves to avoid a redirect loop.
 */

'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATHS = ['/login', '/register', '/auth/callback'];

interface AuthState {
  auth: { isAuthenticated: boolean };
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector((s: AuthState) => s.auth.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (!isPublic && !isAuthenticated) {
      router.push('/login');
    }
  }, [isPublic, isAuthenticated, router]);

  if (!isPublic && !isAuthenticated) {
    return null;
  }

  return children;
}
