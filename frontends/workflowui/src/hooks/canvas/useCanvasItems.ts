/**
 * useCanvasItems Hook
 * Manages canvas items state and load/delete operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProjectIsLoading,
  selectProjectError,
  selectCurrentProjectId,
  selectCanvasItems,
  selectIsResizing,
  setResizing,
  type ProjectCanvasItem,
} from '@metabuilder/redux-slices';
import { useUI } from '@metabuilder/hooks';
import {
  loadCanvasItems as loadItems,
  deleteCanvasItem as deleteItem,
} from './canvasItemOps';

export interface UseCanvasItemsReturn {
  canvasItems: ProjectCanvasItem[];
  isLoading: boolean;
  error: string | null;
  isResizing: boolean;
  loadCanvasItems: () => Promise<void>;
  deleteCanvasItem: (itemId: string) => Promise<void>;
  setResizingState: (isResizing: boolean) => void;
}

export function useCanvasItems(): UseCanvasItemsReturn {
  const dispatch = useDispatch();
  const { error: showError, success: showSuccess } = useUI();
  const [isInitialized, setIsInitialized] = useState(false);

  const projectId = useSelector(selectCurrentProjectId);
  const canvasItems = useSelector(selectCanvasItems);
  const isLoading = useSelector(selectProjectIsLoading);
  const error = useSelector(selectProjectError);
  const isResizing = useSelector(selectIsResizing);

  useEffect(() => {
    if (projectId && !isInitialized) {
      loadCanvasItems();
      setIsInitialized(true);
    }
  }, [projectId, isInitialized]);

  const loadCanvasItems = useCallback(async () => {
    if (!projectId) return;
    await loadItems(projectId, dispatch, showError);
  }, [projectId, dispatch, showError]);

  const deleteCanvasItem = useCallback(
    async (itemId: string) => {
      if (!projectId) return;
      await deleteItem(
        projectId,
        itemId,
        dispatch,
        showError,
        showSuccess
      );
    },
    [projectId, dispatch, showError, showSuccess]
  );

  const setResizingState = useCallback(
    (isResizingState: boolean) => {
      dispatch(setResizing(isResizingState));
    },
    [dispatch]
  );

  return {
    canvasItems,
    isLoading,
    error,
    isResizing,
    loadCanvasItems,
    deleteCanvasItem,
    setResizingState,
  };
}

export default useCanvasItems;
