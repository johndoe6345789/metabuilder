/**
 * useCanvasItems Hook
 * Manages canvas items state and load/delete operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // Project slice
  selectProjectIsLoading,
  selectProjectError,
  selectCurrentProjectId,
  setProjectLoading,
  setProjectError,
  // Canvas items slice
  setCanvasItems,
  removeCanvasItem,
  selectCanvasItems,
  // Canvas slice
  selectIsResizing,
  setResizing,
  // Types
  type ProjectCanvasItem
} from '@metabuilder/redux-slices';
import { projectService } from '@metabuilder/services';
import { projectCanvasItemDB } from '../../db/schema';
import { useUI } from '@metabuilder/hooks';

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

  // Load canvas items when project changes
  useEffect(() => {
    if (projectId && !isInitialized) {
      loadCanvasItems();
      setIsInitialized(true);
    }
  }, [projectId, isInitialized]);

  // Load canvas items from server
  const loadCanvasItems = useCallback(async () => {
    if (!projectId) return;

    dispatch(setProjectLoading(true));
    try {
      const response = await projectService.getCanvasItems(projectId);
      dispatch(setCanvasItems(response.items));

      // Cache in IndexedDB
      await Promise.all(response.items.map((item) => projectCanvasItemDB.update(item)));

      dispatch(setProjectError(null));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load canvas items';
      dispatch(setProjectError(errorMsg));
      showError(errorMsg);
    } finally {
      dispatch(setProjectLoading(false));
    }
  }, [projectId, dispatch, showError]);

  // Delete canvas item
  const deleteCanvasItem = useCallback(
    async (itemId: string) => {
      if (!projectId) return;

      dispatch(setProjectLoading(true));
      try {
        await projectService.deleteCanvasItem(projectId, itemId);
        dispatch(removeCanvasItem(itemId));
        await projectCanvasItemDB.delete(itemId);

        showSuccess('Workflow removed from canvas');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to remove from canvas';
        dispatch(setProjectError(errorMsg));
        showError(errorMsg);
        throw err;
      } finally {
        dispatch(setProjectLoading(false));
      }
    },
    [projectId, dispatch, showError, showSuccess]
  );

  // Set resizing state
  const setResizingState = useCallback((isResizingState: boolean) => {
    dispatch(setResizing(isResizingState));
  }, [dispatch]);

  return {
    canvasItems,
    isLoading,
    error,
    isResizing,
    loadCanvasItems,
    deleteCanvasItem,
    setResizingState
  };
}

export default useCanvasItems;
