/**
 * useUISidebar Hook
 * Manages sidebar open/close state
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  setSidebarOpen,
  toggleSidebar
} from '@metabuilder/redux-slices/uiSlice';

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
      dispatch(setSidebarOpen(open));
    },
    [dispatch]
  );

  const toggleSidebarState = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  return {
    sidebarOpen,
    setSidebar: setSidebarState,
    toggleSidebar: toggleSidebarState
  };
}

export default useUISidebar;
