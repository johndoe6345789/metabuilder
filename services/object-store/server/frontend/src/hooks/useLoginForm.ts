'use client';

import { useState } from 'react';
import { useS3Auth } from './useS3Auth';
import labels from '@/constants/ui-labels.json';

/** @brief Hook return for login form state. */
export interface UseLoginFormReturn {
  accessKey: string;
  secretKey: string;
  error: string;
  loading: boolean;
  setAccessKey: (v: string) => void;
  setSecretKey: (v: string) => void;
  handleSubmit: (
    e: React.FormEvent,
  ) => Promise<void>;
}

/**
 * @brief Stateful logic for the login form.
 */
export function useLoginForm(): UseLoginFormReturn {
  const { login } = useS3Auth();
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(accessKey, secretKey);
    if (!ok) setError(labels.login.error);
    setLoading(false);
  };

  return {
    accessKey,
    secretKey,
    error,
    loading,
    setAccessKey,
    setSecretKey,
    handleSubmit,
  };
}
