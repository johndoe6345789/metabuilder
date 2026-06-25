/**
 * useUILoading Hook
 * Manages loading state and loading messages
 *
 * Requires: ui slice with loading and loadingMessage state
 * Actions: setLoading, setLoadingMessage from uiSlice
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UnknownAction } from 'redux';

// Generic UI state interface - consumers must ensure their store matches
interface UIState {
  loading: boolean;
  loadingMessage: string | null;
}

interface RootState {
  ui: UIState;
}

// Action types compatible with Redux
type SetLoadingAction = UnknownAction & { payload: boolean };
type SetLoadingMessageAction = UnknownAction & { payload: string | null };

export interface UseUILoadingReturn {
  loading: boolean;
  loadingMessage: string | null;
  setLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string | null) => void;
}

/**
 * Factory to create useUILoading with custom action creators
 */
export function createUseUILoading(
  setLoadingAction: (payload: boolean) => SetLoadingAction,
  setLoadingMessageAction: (payload: string | null) => SetLoadingMessageAction
) {
  return function useUILoading(): UseUILoadingReturn {
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.ui.loading);
    const loadingMessage = useSelector((state: RootState) => state.ui.loadingMessage);

    const setIsLoading = useCallback(
      (isLoading: boolean) => {
        dispatch(setLoadingAction(isLoading));
      },
      [dispatch]
    );

    const setLoadMsg = useCallback(
      (message: string | null) => {
        dispatch(setLoadingMessageAction(message));
      },
      [dispatch]
    );

    return {
      loading,
      loadingMessage,
      setLoading: setIsLoading,
      setLoadingMessage: setLoadMsg
    };
  };
}

/**
 * Default hook - requires ui slice actions to be available
 * Import setLoading and setLoadingMessage from your uiSlice
 */
export function useUILoading(): UseUILoadingReturn {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.ui.loading);
  const loadingMessage = useSelector((state: RootState) => state.ui.loadingMessage);

  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      dispatch({ type: 'ui/setLoading', payload: isLoading });
    },
    [dispatch]
  );

  const setLoadMsg = useCallback(
    (message: string | null) => {
      dispatch({ type: 'ui/setLoadingMessage', payload: message });
    },
    [dispatch]
  );

  return {
    loading,
    loadingMessage,
    setLoading: setIsLoading,
    setLoadingMessage: setLoadMsg
  };
}

export default useUILoading;
