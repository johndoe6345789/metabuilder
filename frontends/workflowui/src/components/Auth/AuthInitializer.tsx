/**
 * Auth Initializer Component
 *
 * redux-persist already rehydrates the `auth` slice (token/user/
 * isAuthenticated) from IndexedDB before this renders (see PersistGate in
 * RootLayoutClient) -- this only needs to validate the restored token and
 * sync the in-memory dbal-sso token bridge (used by createAuthenticatedFetch)
 * with whatever Redux holds. An expired token just signs the user out; DBAL
 * SSO redirects them back through login on their next protected-page visit.
 */

'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthToken, isTokenValid } from '@metabuilder/dbal-sso/core';
import { logout } from '@metabuilder/redux-slices';

interface AuthState {
  auth: { token: string | null };
}

export function AuthInitializer() {
  const dispatch = useDispatch();
  const token = useSelector((s: AuthState) => s.auth.token);

  useEffect(() => {
    if (!token) return;

    if (isTokenValid(token)) {
      setAuthToken(token);
      return;
    }

    setAuthToken(null);
    dispatch(logout());
  }, [token, dispatch]);

  return null;
}
