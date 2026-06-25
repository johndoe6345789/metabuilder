'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BASE_PATH } from '@/lib/app-config';

export function useAdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turboError, setTurboError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_PATH}/api/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleTurboLogin = async () => {
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
      setUsername(data.user as string);
      setPassword(data.pass as string);
      setError('');
      setLoading(true);
      const response = await fetch(`${BASE_PATH}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.user, password: data.pass }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Login failed');
        setLoading(false);
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setTurboError('Could not read clipboard. Please allow clipboard access and try again.');
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    handleTurboLogin,
    turboError,
    clearTurboError: () => setTurboError(null),
  };
}
