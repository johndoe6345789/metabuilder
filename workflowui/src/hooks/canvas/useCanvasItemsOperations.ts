/**
 * useCanvasItemsOperations Hook
 * Manages canvas items create, update, and bulk operations
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  setLoading,
  setError,
  selectCurrentProjectId
} from '../../store/slices/projectSlice';
import {
  addCanvasItem,
  updateCanvasItem,
  bulkUpdateCanvasItems
} from '../../store/slices/canvasItemsSlice';
import projectService from '../../services/projectService';
import { projectCanvasItemDB } from '../../db/schema';
import {
  ProjectCanvasItem,
  CreateCanvasItemRequest,
  UpdateCanvasItemRequest
} from '../../types/project';
import { useUI } from '../useUI';

export interface UseCanvasItemsOperationsReturn {
  createCanvasItem: (data: CreateCanvasItemRequest) => Promise<ProjectCanvasItem | null>;
  updateCanvasItem: (itemId: string, data: UpdateCanvasItemRequest) => Promise<ProjectCanvasItem | null>;
  bulkUpdateItems: (updates: Array<Partial<ProjectCanvasItem> & { id: string }>) => Promise<void>;
}

export function useCanvasItemsOperations(): UseCanvasItemsOperationsReturn {
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useUI() as any;
  const projectId = useSelector((state: RootState) => selectCurrentProjectId(state));

  // Create canvas item
  const createCanvasItem = useCallback(
    async (data: CreateCanvasItemRequest) => {
      if (!projectId) return null;

      dispatch(setLoading(true));
      try {
        const item = await projectService.createCanvasItem(projectId, data);
        dispatch(addCanvasItem(item));
        await projectCanvasItemDB.create(item);

        showNotification('Workflow added to canvas', 'success');
        return item;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add workflow to canvas';
        dispatch(setError(errorMsg));
        showNotification(errorMsg, 'error');
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [projectId, dispatch, showNotification]
  );

  // Update canvas item
  const updateCanvasItemData = useCallback(
    async (itemId: string, data: UpdateCanvasItemRequest) => {
      if (!projectId) return null;

      try {
        const updated = await projectService.updateCanvasItem(projectId, itemId, data);
        dispatch(updateCanvasItem({ ...updated, id: itemId }));
        await projectCanvasItemDB.update(updated);

        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update canvas item';
        dispatch(setError(errorMsg));
        showNotification(errorMsg, 'error');
        throw err;
      }
    },
    [projectId, dispatch, showNotification]
  );

  // Bulk update canvas items
  const bulkUpdateItems = useCallback(
    async (updates: Array<Partial<ProjectCanvasItem> & { id: string }>) => {
      if (!projectId) return;

      try {
        const response = await projectService.bulkUpdateCanvasItems(projectId, { items: updates });
        dispatch(bulkUpdateCanvasItems(response.items));

        // Update IndexedDB cache
        await Promise.all(response.items.map((item) => projectCanvasItemDB.update(item)));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update canvas items';
        dispatch(setError(errorMsg));
        showNotification(errorMsg, 'error');
        throw err;
      }
    },
    [projectId, dispatch, showNotification]
  );

  return {
    createCanvasItem,
    updateCanvasItem: updateCanvasItemData,
    bulkUpdateItems
  };
}

export default useCanvasItemsOperations;
