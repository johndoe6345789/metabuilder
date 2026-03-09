/**
 * Auth Initializer Component
 * Restores user session from localStorage on app startup
 */

'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreFromStorage } from '@metabuilder/redux-slices';

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth session from localStorage
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('current_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch(
          restoreFromStorage({
            token,
            user
          })
        );
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      // Continue without auth - user will need to login
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
}
