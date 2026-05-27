/**
 * useLoginPage - Login page UI state
 */

'use client';

import { useState } from 'react';
import { useAuthForm, useLoginLogic } from '../../../hooks';

export function useLoginPage() {
  const {
    email,
    password,
    localError,
    isLoading,
    errorMessage,
    setEmail,
    setPassword,
    clearErrors,
  } = useAuthForm();
  const { handleLogin } = useLoginLogic();
  const [rememberMe, setRememberMe] = useState(false);
  const [useSalesforceStyle, setUseSalesforceStyle] = useState(true);

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    try {
      await handleLogin({ email, password });
    } catch {
      // Error is handled by hook
    }
  };

  return {
    email,
    password,
    localError,
    isLoading,
    errorMessage,
    setEmail,
    setPassword,
    rememberMe,
    setRememberMe,
    useSalesforceStyle,
    setUseSalesforceStyle,
    onLoginSubmit,
  };
}
