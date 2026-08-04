'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeLogin } from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from '@/lib/dbalSsoConfig';
import { BASE_PATH } from '@/lib/app-config';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      setError('Missing code/state in callback URL');
      return;
    }

    completeLogin(dbalSsoConfig, code, state)
      .then(async (tokens) => {
        const res = await fetch(`${BASE_PATH}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokens.token }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Not authorized');
        }
        router.push('/admin/dashboard');
        router.refresh();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      });
  }, [searchParams, router]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c0392b', marginBottom: '12px' }}>{error}</p>
          <a href="/admin/login">Back to sign in</a>
        </div>
      ) : (
        <p>Signing in…</p>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
