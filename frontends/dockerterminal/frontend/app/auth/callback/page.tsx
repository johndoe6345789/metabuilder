'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeLogin } from '@metabuilder/dbal-sso/core';
import { dbalSsoConfig } from '@/lib/dbalSsoConfig';
import { savePersistedSession } from '@/lib/auth';

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
      .then(tokens => {
        savePersistedSession({ token: tokens.token, refreshToken: tokens.refreshToken });
        window.location.href = '/terminal/dashboard';
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      });
  }, [searchParams, router]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', color: '#fff', background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', marginBottom: '12px' }}>{error}</p>
          <a href="/terminal" style={{ color: '#38b2ac' }}>Back to sign in</a>
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
