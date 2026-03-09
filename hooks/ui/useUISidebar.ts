/**
 * useUISidebar Hook
 * Manages sidebar open/close state
 *
 * Requires: ui slice with sidebarOpen state
 * Actions: setSidebarOpen, toggleSidebar from uiSlice
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Generic UI state interface
interface UIState {
  sidebarOpen: boolean;
}

interface RootState {
  ui: UIState;
}

export interface UseUISidebarReturn {
  sidebarOpen: boolean;
  setSidebar: (open: boolean) => void;
  toggleSidebar: () => void;
}

export function useUISidebar(): UseUISidebarReturn {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  const setSidebarState = useCallback(
    (open: boolean) => {
      dispatch({ type: 'ui/setSidebarOpen', payload: open });
    },
    [dispatch]
  );

  const toggleSidebarState = useCallback(() => {
    dispatch({ type: 'ui/toggleSidebar' });
  }, [dispatch]);

  return {
    sidebarOpen,
    setSidebar: setSidebarState,
    toggleSidebar: toggleSidebarState
  };
}

export default useUISidebar;
