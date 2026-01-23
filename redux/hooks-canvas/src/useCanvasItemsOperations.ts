/**
 * useCanvasItemsOperations Hook (Tier 2)
 * Manages canvas items creation and updates with service adapter injection
 *
 * Features:
 * - Create canvas items
 * - Update canvas items
 * - Bulk update canvas items
 * - Service adapter integration
 * - Redux integration
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useServices } from '@metabuilder/service-adapters'
import {
  setLoading,
  setError,
  selectCurrentProjectId,
} from '@metabuilder/redux-slices'
import {
  addCanvasItem,
  updateCanvasItem,
  bulkUpdateCanvasItems,
} from '@metabuilder/redux-slices'
import type {
  ProjectCanvasItem,
  CreateCanvasItemRequest,
  UpdateCanvasItemRequest,
} from '@metabuilder/service-adapters'
import type { AppDispatch, RootState } from '@metabuilder/redux-slices'

export interface UseCanvasItemsOperationsReturn {
  createCanvasItem: (data: CreateCanvasItemRequest) => Promise<ProjectCanvasItem | null>
  updateCanvasItem: (itemId: string, data: UpdateCanvasItemRequest) => Promise<ProjectCanvasItem | null>
  bulkUpdateItems: (updates: Array<Partial<ProjectCanvasItem> & { id: string }>) => Promise<void>
}

/**
 * useCanvasItemsOperations Hook
 * Manages canvas item creation and updates with service adapter injection
 *
 * @example
 * const { createCanvasItem, updateCanvasItem, bulkUpdateItems } = useCanvasItemsOperations();
 * const item = await createCanvasItem({ workflowId: 'wf-123', x: 100, y: 200 });
 */
export function useCanvasItemsOperations(): UseCanvasItemsOperationsReturn {
  const dispatch = useDispatch<AppDispatch>()
  const { projectService } = useServices()
  const projectId = useSelector((state: RootState) => selectCurrentProjectId(state))

  /**
   * Create new canvas item
   */
  const createCanvasItem = useCallback(
    async (data: CreateCanvasItemRequest) => {
      if (!projectId) return null

      dispatch(setLoading(true))
      try {
        const item = await projectService.createCanvasItem(projectId, data)
        dispatch(addCanvasItem(item))
        return item
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create canvas item'
        dispatch(setError(errorMsg))
        throw err
      } finally {
        dispatch(setLoading(false))
      }
    },
    [projectId, dispatch, projectService]
  )

  /**
   * Update canvas item
   */
  const updateCanvasItemData = useCallback(
    async (itemId: string, data: UpdateCanvasItemRequest) => {
      if (!projectId) return null

      try {
        const updated = await projectService.updateCanvasItem(projectId, itemId, data)
        dispatch(updateCanvasItem({ ...updated, id: itemId }))
        return updated
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update canvas item'
        dispatch(setError(errorMsg))
        throw err
      }
    },
    [projectId, dispatch, projectService]
  )

  /**
   * Bulk update canvas items
   */
  const bulkUpdateItems = useCallback(
    async (updates: Array<Partial<ProjectCanvasItem> & { id: string }>) => {
      if (!projectId) return

      try {
        const items = await projectService.bulkUpdateCanvasItems(projectId, updates)
        dispatch(bulkUpdateCanvasItems(items))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to bulk update canvas items'
        dispatch(setError(errorMsg))
        throw err
      }
    },
    [projectId, dispatch, projectService]
  )

  return {
    createCanvasItem,
    updateCanvasItem: updateCanvasItemData,
    bulkUpdateItems,
  }
}

export default useCanvasItemsOperations
