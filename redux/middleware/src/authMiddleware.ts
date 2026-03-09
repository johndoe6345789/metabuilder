/**
 * Redux Middleware for Authentication
 * Handles auth header injection for API requests and session restoration
 */

import { Middleware, UnknownAction } from '@reduxjs/toolkit';

/**
 * Action type for restoring auth from storage
 */
type RestoreFromStorageAction = UnknownAction & {
  type: 'auth/restoreFromStorage';
  payload: {
    token: string;
    user: any;
  };
};

/**
 * Creates the auth middleware with the provided restore action creator
 * @param restoreFromStorage - Action creator for restoring auth state from storage
 * @returns Redux middleware function
 */
export function createAuthMiddleware(
  restoreFromStorage: (payload: { token: string; user: any }) => RestoreFromStorageAction
): Middleware {
  return (store) => (next) => (action: any) => {
    // Restore session from localStorage on app initialization
    if (
      (action.type === '@@INIT' || action.type === 'auth/restoreFromStorage') &&
      typeof window !== 'undefined'
    ) {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('current_user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          store.dispatch(
            restoreFromStorage({
              token,
              user,
            })
          );
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        // Continue without auth
      }
    }

    return next(action);
  };
}

/**
 * Legacy auth middleware for backwards compatibility
 * Note: Prefer using createAuthMiddleware with explicit action creator
 * @deprecated Use createAuthMiddleware instead
 */
export const authMiddleware: Middleware = (store) => (next) => (action: any) => {
  // Restore session from localStorage on app initialization
  if (
    (action.type === '@@INIT' || action.type === 'auth/restoreFromStorage') &&
    typeof window !== 'undefined'
  ) {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('current_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        store.dispatch({
          type: 'auth/restoreFromStorage',
          payload: {
            token,
            user,
          },
        });
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      // Continue without auth
    }
  }

  return next(action);
};

/**
 * Global fetch interceptor to inject auth headers
 * This wraps the native fetch to automatically add Authorization header
 */
export function initAuthInterceptor(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = function (...args: Parameters<typeof fetch>) {
    const [resource, config = {}] = args;

    // Get current auth token from localStorage
    const token = localStorage.getItem('auth_token');

    if (token) {
      const headers = new Headers(config.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      (config as RequestInit).headers = headers;
    }

    return originalFetch.apply(window, [resource, config] as [RequestInfo | URL, RequestInit?]);
  };
}
