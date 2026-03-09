/**
 * useUITheme Hook
 * Manages theme state, persistence, and document attribute syncing
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  setTheme,
  toggleTheme
} from '@metabuilder/redux-slices/uiSlice';

export interface UseUIThemeReturn {
  theme: 'light' | 'dark';
  setTheme: (newTheme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export function useUITheme(): UseUIThemeReturn {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  /**
   * Set theme
   */
  const setCurrentTheme = useCallback(
    (newTheme: 'light' | 'dark') => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  /**
   * Toggle theme
   */
  const toggleCurrentTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  /**
   * Apply theme to document
   */
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  /**
   * Load theme preference from localStorage
   */
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('workflow-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        dispatch(setTheme(savedTheme));
      }
    }
  }, [dispatch]);

  return {
    theme,
    setTheme: setCurrentTheme,
    toggleTheme: toggleCurrentTheme
  };
}

export default useUITheme;
