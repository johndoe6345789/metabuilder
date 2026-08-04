'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { completeLogin, decodeJwtPayload } from '@metabuilder/dbal-sso/core';
import { setAuthenticated } from '@metabuilder/redux-slices';
import { dbalSsoConfig } from '../../../lib/dbalSsoConfig';
import styles from '../../login/page.module.scss';

function AuthCallbackContent() {
  const router = useRouter();
  const dispatch = useDispatch();
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
        const claims = decodeJwtPayload(tokens.token);
        const role = typeof claims.role === 'string' ? claims.role : undefined;
        dispatch(setAuthenticated({
          token: tokens.token,
          user: { id: tokens.user.id, email: tokens.user.username, name: tokens.user.username, role },
        }));
        router.replace('/');
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      });
  }, [searchParams, router, dispatch]);

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        {error !== null ? (
          <>
            <p className={styles.error}>{error}</p>
            <a href="/login">Back to sign in</a>
          </>
        ) : (
          <p className={styles.subtitle}>Signing in…</p>
        )}
      </div>
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
