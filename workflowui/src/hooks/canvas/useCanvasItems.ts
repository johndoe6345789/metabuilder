/**
 * useCanvasItems Hook
 * Manages canvas items state and load/delete operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  selectProjectIsLoading,
  selectProjectError,
  selectCurrentProjectId,
  setLoading,
  setError
} from '../../store/slices/projectSlice';
import {
  setCanvasItems,
  removeCanvasItem,
  selectCanvasItems
} from '../../store/slices/canvasItemsSlice';
import {
  selectIsResizing,
  setResizing
} from '../../store/slices/canvasSlice';
import projectService from '../../services/projectService';
import { projectCanvasItemDB } from '../../db/schema';
import { ProjectCanvasItem } from '../../types/project';
import { useUI } from '../useUI';

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
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useUI() as any;
  const [isInitialized, setIsInitialized] = useState(false);

  const projectId = useSelector((state: RootState) => selectCurrentProjectId(state));
  const canvasItems = useSelector((state: RootState) => selectCanvasItems(state));
  const isLoading = useSelector((state: RootState) => selectProjectIsLoading(state));
  const error = useSelector((state: RootState) => selectProjectError(state));
  const isResizing = useSelector((state: RootState) => selectIsResizing(state));

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

    dispatch(setLoading(true));
    try {
      const response = await projectService.getCanvasItems(projectId);
      dispatch(setCanvasItems(response.items));

      // Cache in IndexedDB
      await Promise.all(response.items.map((item) => projectCanvasItemDB.update(item)));

      dispatch(setError(null));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load canvas items';
      dispatch(setError(errorMsg));
      showNotification(errorMsg, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  }, [projectId, dispatch, showNotification]);

  // Delete canvas item
  const deleteCanvasItem = useCallback(
    async (itemId: string) => {
      if (!projectId) return;

      dispatch(setLoading(true));
      try {
        await projectService.deleteCanvasItem(projectId, itemId);
        dispatch(removeCanvasItem(itemId));
        await projectCanvasItemDB.delete(itemId);

        showNotification('Workflow removed from canvas', 'success');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to remove from canvas';
        dispatch(setError(errorMsg));
        showNotification(errorMsg, 'error');
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [projectId, dispatch, showNotification]
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
