'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCredentials } from '@/utils';
import routes from '@/constants/routes.json';

/** @brief Props for AuthGuard molecule. */
export interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * @brief Redirects to login if not authenticated.
 * @param props - AuthGuard properties.
 */
export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!getCredentials()) {
      router.replace(routes.login);
    }
  }, [router]);

  if (typeof window !== 'undefined'
    && !getCredentials()) {
    return null;
  }

  return <>{children}</>;
}
