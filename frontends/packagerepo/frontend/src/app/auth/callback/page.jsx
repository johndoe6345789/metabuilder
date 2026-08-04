'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { completeOidcLogin } from '../../../store/authSlice';

function AuthCallbackContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      setError('Missing code/state in callback URL');
      return;
    }

    dispatch(completeOidcLogin({ code, state }))
      .unwrap()
      .then(() => router.replace('/'))
      .catch((e) => setError(typeof e === 'string' ? e : 'Sign-in failed'));
  }, [searchParams, router, dispatch]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', color: '#333',
    }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c0392b', marginBottom: '12px' }}>{error}</p>
          <a href="/packagerepo/login">Back to sign in</a>
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
