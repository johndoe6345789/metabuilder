/**
 * useCanvasItems Hook (Tier 2)
 * Manages canvas items loading and deletion with service adapter injection
 *
 * Features:
 * - Load canvas items from service adapter
 * - Delete canvas items
 * - Resizing state management
 * - Auto-loads on project change
 * - Redux integration
 */

import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useServices } from '@metabuilder/service-adapters'
import {
  selectProjectIsLoading,
  selectProjectError,
  selectCurrentProjectId,
  setProjectLoading,
  setProjectError,
} from '@metabuilder/redux-slices'
import {
  setCanvasItems,
  removeCanvasItem,
  selectCanvasItems,
} from '@metabuilder/redux-slices'
import {
  selectIsResizing,
  setResizing,
} from '@metabuilder/redux-slices'
import type { ProjectCanvasItem } from '@metabuilder/service-adapters'
import type { AppDispatch, RootState } from '@metabuilder/redux-slices'

export interface UseCanvasItemsReturn {
  canvasItems: ProjectCanvasItem[]
  isLoading: boolean
  error: string | null
  isResizing: boolean
  loadCanvasItems: () => Promise<void>
  deleteCanvasItem: (itemId: string) => Promise<void>
  setResizingState: (isResizing: boolean) => void
}

/**
 * useCanvasItems Hook
 * Manages canvas item loading and deletion with service adapter injection
 *
 * @example
 * const { canvasItems, loadCanvasItems, deleteCanvasItem } = useCanvasItems();
 * await deleteCanvasItem('item-123');
 */
export function useCanvasItems(): UseCanvasItemsReturn {
  const dispatch = useDispatch<AppDispatch>()
  const { projectService } = useServices()
  const [isInitialized, setIsInitialized] = useState(false)

  const projectId = useSelector((state: RootState) => selectCurrentProjectId(state))
  const canvasItems = useSelector((state: RootState) => selectCanvasItems(state))
  const isLoading = useSelector((state: RootState) => selectProjectIsLoading(state))
  const error = useSelector((state: RootState) => selectProjectError(state))
  const isResizing = useSelector((state: RootState) => selectIsResizing(state))

  /**
   * Auto-load canvas items when project changes
   */
  useEffect(() => {
    if (projectId && !isInitialized) {
      loadCanvasItems()
      setIsInitialized(true)
    }
  }, [projectId, isInitialized])

  /**
   * Load canvas items from service adapter
   */
  const loadCanvasItems = useCallback(async () => {
    if (!projectId) return

    dispatch(setProjectLoading(true))
    try {
      const items = await projectService.getCanvasItems(projectId)
      dispatch(setCanvasItems(items))
      dispatch(setProjectError(null))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load canvas items'
      dispatch(setProjectError(errorMsg))
      throw err
    } finally {
      dispatch(setProjectLoading(false))
    }
  }, [projectId, dispatch, projectService])

  /**
   * Delete canvas item
   */
  const deleteCanvasItem = useCallback(
    async (itemId: string) => {
      if (!projectId) return

      dispatch(setProjectLoading(true))
      try {
        await projectService.deleteCanvasItem(projectId, itemId)
        dispatch(removeCanvasItem(itemId))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete canvas item'
        dispatch(setProjectError(errorMsg))
        throw err
      } finally {
        dispatch(setProjectLoading(false))
      }
    },
    [projectId, dispatch, projectService]
  )

  /**
   * Update resizing state
   */
  const setResizingState = useCallback(
    (isResizingState: boolean) => {
      dispatch(setResizing(isResizingState))
    },
    [dispatch]
  )

  return {
    canvasItems,
    isLoading,
    error,
    isResizing,
    loadCanvasItems,
    deleteCanvasItem,
    setResizingState,
  }
}

export default useCanvasItems
