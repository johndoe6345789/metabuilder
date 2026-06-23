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
  const [turboError, setTurboError] = useState<string | null>(null);

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    try {
      await handleLogin({ email, password });
    } catch {
      // Error is handled by hook
    }
  };

  const onTurboLogin = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      if (!raw.trim()) {
        setTurboError('Clipboard is empty. Copy a Turbologin from Vault first.');
        return;
      }
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(raw);
      } catch {
        setTurboError('Clipboard does not contain valid Turbologin JSON.');
        return;
      }
      if (!data.user || !data.pass) {
        setTurboError('Clipboard JSON is missing required fields (user, pass).');
        return;
      }
      setEmail(data.user as string);
      setPassword(data.pass as string);
      if (typeof data.rememberMe === 'boolean') setRememberMe(data.rememberMe);
      await handleLogin({ email: data.user as string, password: data.pass as string });
    } catch {
      setTurboError('Could not read clipboard. Please allow clipboard access and try again.');
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
    onTurboLogin,
    turboError,
    clearTurboError: () => setTurboError(null),
  };
}
