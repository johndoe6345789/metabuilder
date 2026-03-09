/**
 * useCanvasItemsOperations Hook
 * Manages canvas items create, update, and bulk operations
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setProjectLoading,
  setProjectError,
  selectCurrentProjectId,
  addCanvasItem,
  updateCanvasItem,
  bulkUpdateCanvasItems,
  type ProjectCanvasItem
} from '@metabuilder/redux-slices';
import { projectService, type CreateCanvasItemRequest, type UpdateCanvasItemRequest } from '@metabuilder/services';
import { projectCanvasItemDB } from '../../db/schema';
import { useUI } from '@metabuilder/hooks';

export interface UseCanvasItemsOperationsReturn {
  createCanvasItem: (data: CreateCanvasItemRequest) => Promise<ProjectCanvasItem | null>;
  updateCanvasItem: (itemId: string, data: UpdateCanvasItemRequest) => Promise<ProjectCanvasItem | null>;
  bulkUpdateItems: (updates: Array<Partial<ProjectCanvasItem> & { id: string }>) => Promise<void>;
}

export function useCanvasItemsOperations(): UseCanvasItemsOperationsReturn {
  const dispatch = useDispatch();
  const { error: showError, success: showSuccess } = useUI();
  const projectId = useSelector(selectCurrentProjectId);

  // Create canvas item
  const createCanvasItem = useCallback(
    async (data: CreateCanvasItemRequest) => {
      if (!projectId) return null;

      dispatch(setProjectLoading(true));
      try {
        const item = await projectService.createCanvasItem(projectId, data);
        dispatch(addCanvasItem(item));
        await projectCanvasItemDB.create(item);

        showSuccess('Workflow added to canvas');
        return item;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add workflow to canvas';
        dispatch(setProjectError(errorMsg));
        showError(errorMsg);
        throw err;
      } finally {
        dispatch(setProjectLoading(false));
      }
    },
    [projectId, dispatch, showError, showSuccess]
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
        dispatch(setProjectError(errorMsg));
        showError(errorMsg);
        throw err;
      }
    },
    [projectId, dispatch, showError]
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
        dispatch(setProjectError(errorMsg));
        showError(errorMsg);
        throw err;
      }
    },
    [projectId, dispatch, showError]
  );

  return {
    createCanvasItem,
    updateCanvasItem: updateCanvasItemData,
    bulkUpdateItems
  };
}

export default useCanvasItemsOperations;
