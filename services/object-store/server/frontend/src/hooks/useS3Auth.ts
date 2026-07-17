'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { S3Credentials } from '@/types';
import {
  getCredentials,
  saveCredentials,
  clearCredentials,
  s3Fetch,
} from '@/utils';
import routes from '@/constants/routes.json';

/** @brief Hook return type for S3 auth. */
export interface UseS3AuthReturn {
  isAuthenticated: boolean;
  credentials: S3Credentials | null;
  login: (
    accessKey: string,
    secretKey: string,
  ) => Promise<boolean>;
  logout: () => void;
}

/**
 * @brief Manage S3 auth credentials.
 * @returns Auth state and login/logout actions.
 */
export function useS3Auth(): UseS3AuthReturn {
  const router = useRouter();
  const [credentials, setCredentials] =
    useState<S3Credentials | null>(
      getCredentials,
    );

  const login = useCallback(
    async (
      accessKey: string,
      secretKey: string,
    ): Promise<boolean> => {
      const creds = { accessKey, secretKey };
      saveCredentials(creds);
      const res = await s3Fetch('/api/s3/buckets');
      if (!res.ok) {
        clearCredentials();
        setCredentials(null);
        return false;
      }
      setCredentials(creds);
      router.push(routes.dashboard);
      return true;
    },
    [router],
  );

  const logout = useCallback(() => {
    clearCredentials();
    setCredentials(null);
    router.push(routes.login);
  }, [router]);

  return {
    isAuthenticated: credentials !== null,
    credentials,
    login,
    logout,
  };
}
