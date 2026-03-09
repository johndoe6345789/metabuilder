/**
 * useUITheme Hook
 * Manages theme state, persistence, and document attribute syncing
 *
 * Requires: ui slice with theme state ('light' | 'dark')
 * Actions: setTheme, toggleTheme from uiSlice
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Generic UI state interface
interface UIState {
  theme: 'light' | 'dark';
}

interface RootState {
  ui: UIState;
}

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
      dispatch({ type: 'ui/setTheme', payload: newTheme });
    },
    [dispatch]
  );

  /**
   * Toggle theme
   */
  const toggleCurrentTheme = useCallback(() => {
    dispatch({ type: 'ui/toggleTheme' });
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
        dispatch({ type: 'ui/setTheme', payload: savedTheme });
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
