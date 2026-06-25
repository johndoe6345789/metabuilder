/**
 * Hook for the dashboard light/dark theme.
 *
 * The initial value is applied before paint by an inline script in the admin
 * layout (reads localStorage, falls back to prefers-color-scheme) so there is
 * no flash of the wrong theme. This hook reads that applied value and lets the
 * UI toggle + persist it via the M3 `[data-theme]` token override.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'pg-admin-theme';

function currentDomTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('light');

  // Sync React state with the theme the pre-paint script already applied.
  useEffect(() => {
    setMode(currentDomTheme());
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    setMode(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(currentDomTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { mode, setTheme, toggleTheme };
}
