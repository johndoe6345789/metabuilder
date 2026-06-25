/**
 * useCanvasItemsOperations Hook
 * Manages canvas items create, update, and bulk operations
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentProjectId,
  type ProjectCanvasItem,
} from '@metabuilder/redux-slices';
import {
  type CreateCanvasItemRequest,
  type UpdateCanvasItemRequest,
} from '@metabuilder/services';
import { useUI } from '@metabuilder/hooks';
import {
  createItem,
  updateItem,
  bulkUpdate,
} from './canvasItemsOps';

export interface UseCanvasItemsOperationsReturn {
  createCanvasItem: (
    data: CreateCanvasItemRequest
  ) => Promise<ProjectCanvasItem | null>;
  updateCanvasItem: (
    itemId: string,
    data: UpdateCanvasItemRequest
  ) => Promise<ProjectCanvasItem | null>;
  bulkUpdateItems: (
    updates: Array<
      Partial<ProjectCanvasItem> & { id: string }
    >
  ) => Promise<void>;
}

export function useCanvasItemsOperations():
  UseCanvasItemsOperationsReturn {
  const dispatch = useDispatch();
  const { error: showError, success: showSuccess } = useUI();
  const projectId = useSelector(selectCurrentProjectId);

  const createCanvasItem = useCallback(
    (data: CreateCanvasItemRequest) => {
      if (!projectId) return Promise.resolve(null);
      return createItem(
        projectId,
        data,
        dispatch,
        showError,
        showSuccess
      );
    },
    [projectId, dispatch, showError, showSuccess]
  );

  const updateCanvasItem = useCallback(
    (itemId: string, data: UpdateCanvasItemRequest) => {
      if (!projectId) return Promise.resolve(null);
      return updateItem(
        projectId,
        itemId,
        data,
        dispatch,
        showError
      );
    },
    [projectId, dispatch, showError]
  );

  const bulkUpdateItems = useCallback(
    (
      updates: Array<
        Partial<ProjectCanvasItem> & { id: string }
      >
    ) => {
      if (!projectId) return Promise.resolve();
      return bulkUpdate(
        projectId,
        updates,
        dispatch,
        showError
      );
    },
    [projectId, dispatch, showError]
  );

  return {
    createCanvasItem,
    updateCanvasItem,
    bulkUpdateItems,
  };
}

export default useCanvasItemsOperations;
