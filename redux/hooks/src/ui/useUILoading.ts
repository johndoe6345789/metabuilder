/**
 * useUILoading Hook
 * Manages loading state and loading messages
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  setLoading,
  setLoadingMessage
} from '@metabuilder/redux-slices/uiSlice';

export interface UseUILoadingReturn {
  loading: boolean;
  loadingMessage: string | null;
  setLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string | null) => void;
}

export function useUILoading(): UseUILoadingReturn {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.ui.loading);
  const loadingMessage = useSelector((state: RootState) => state.ui.loadingMessage);

  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      dispatch(setLoading(isLoading));
    },
    [dispatch]
  );

  const setLoadMsg = useCallback(
    (message: string | null) => {
      dispatch(setLoadingMessage(message));
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
