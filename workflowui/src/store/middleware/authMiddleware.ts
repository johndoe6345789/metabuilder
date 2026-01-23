/**
 * Redux Middleware for Authentication
 * Handles auth header injection for API requests and session restoration
 */

import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { authService } from '../../services/authService';
import { restoreFromStorage } from '../../store/slices/authSlice';

/**
 * Authentication middleware
 * - Restores user session from localStorage on app startup
 * - Injects auth headers on API requests
 */
export const authMiddleware = ((store: any) => (next: any) => (action: any) => {
  // Restore session from localStorage on app initialization
  if ((action.type === '@@INIT' || action.type === 'auth/restoreFromStorage') && typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('current_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        store.dispatch(
          restoreFromStorage({
            token,
            user
          })
        );
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      // Continue without auth
    }
  }

  return next(action);
}) as any;

/**
 * Global fetch interceptor to inject auth headers
 * This wraps the native fetch to automatically add Authorization header
 */
export function initAuthInterceptor() {
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
      config.headers = headers;
    }

    return originalFetch.apply(window, [resource, config] as any);
  } as typeof fetch;
}
