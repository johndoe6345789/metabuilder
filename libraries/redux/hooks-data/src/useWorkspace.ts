/**
 * useWorkspace Hook (Tier 2)
 * Manages workspace state and operations with service adapter injection
 *
 * Features:
 * - Load workspaces from service adapter
 * - Create, update, delete workspaces
 * - Switch between workspaces
 * - Auto-loads workspaces on initialization
 * - Redux integration for state management
 */

import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useServices } from '@metabuilder/service-adapters'
import {
  setWorkspaces,
  addWorkspace,
  updateWorkspace,
  removeWorkspace,
  setCurrentWorkspace,
  setWorkspaceLoading,
  setWorkspaceError,
  selectWorkspaces,
  selectCurrentWorkspace,
  selectCurrentWorkspaceId,
  selectWorkspaceIsLoading,
  selectWorkspaceError,
} from '@metabuilder/redux-slices'
import type { Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest } from '@metabuilder/service-adapters'
import type { AppDispatch, RootState } from '@metabuilder/redux-slices'

/**
 * useWorkspace Hook
 * Manages workspace operations with service adapter injection
 *
 * @example
 * const { workspaces, createWorkspace, loadWorkspaces } = useWorkspace();
 * await loadWorkspaces(); // Auto-loads on first render
 * const newWorkspace = await createWorkspace({ name: 'My Workspace' });
 */
export function useWorkspace() {
  const dispatch = useDispatch<AppDispatch>()
  const { workspaceService } = useServices()
  const [isInitialized, setIsInitialized] = useState(false)

  // Selectors
  const workspaces = useSelector((state: RootState) => selectWorkspaces(state))
  const currentWorkspace = useSelector((state: RootState) => selectCurrentWorkspace(state))
  const currentWorkspaceId = useSelector((state: RootState) => selectCurrentWorkspaceId(state))
  const isLoading = useSelector((state: RootState) => selectWorkspaceIsLoading(state))
  const error = useSelector((state: RootState) => selectWorkspaceError(state))

  // Get tenant ID from localStorage
  const getTenantId = useCallback(() => {
    return localStorage.getItem('tenantId') || 'default'
  }, [])

  /**
   * Auto-load workspaces on initialization
   */
  useEffect(() => {
    if (!isInitialized) {
      loadWorkspaces()
      setIsInitialized(true)
    }
  }, [isInitialized])

  /**
   * Load workspaces from service adapter
   */
  const loadWorkspaces = useCallback(async () => {
    dispatch(setWorkspaceLoading(true))
    try {
      const tenantId = getTenantId()
      const workspaceList = await workspaceService.listWorkspaces(tenantId)
      dispatch(setWorkspaces(workspaceList))

      // Set default workspace if not already set
      if (!currentWorkspaceId && workspaceList.length > 0) {
        dispatch(setCurrentWorkspace(workspaceList[0].id))
        localStorage.setItem('currentWorkspaceId', workspaceList[0].id)
      }

      dispatch(setWorkspaceError(null))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load workspaces'
      dispatch(setWorkspaceError(errorMsg))
      throw err
    } finally {
      dispatch(setWorkspaceLoading(false))
    }
  }, [dispatch, getTenantId, currentWorkspaceId, workspaceService])

  /**
   * Create new workspace
   */
  const createWorkspace = useCallback(
    async (data: CreateWorkspaceRequest) => {
      dispatch(setWorkspaceLoading(true))
      try {
        const tenantId = getTenantId()
        const workspace = await workspaceService.createWorkspace({
          ...data,
          tenantId,
        })
        dispatch(addWorkspace(workspace))
        return workspace
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create workspace'
        dispatch(setWorkspaceError(errorMsg))
        throw err
      } finally {
        dispatch(setWorkspaceLoading(false))
      }
    },
    [dispatch, getTenantId, workspaceService]
  )

  /**
   * Update existing workspace
   */
  const updateWorkspaceData = useCallback(
    async (id: string, data: UpdateWorkspaceRequest) => {
      dispatch(setWorkspaceLoading(true))
      try {
        const updated = await workspaceService.updateWorkspace(id, data)
        dispatch(updateWorkspace(updated))
        return updated
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update workspace'
        dispatch(setWorkspaceError(errorMsg))
        throw err
      } finally {
        dispatch(setWorkspaceLoading(false))
      }
    },
    [dispatch, workspaceService]
  )

  /**
   * Delete workspace
   */
  const deleteWorkspace = useCallback(
    async (id: string) => {
      dispatch(setWorkspaceLoading(true))
      try {
        await workspaceService.deleteWorkspace(id)
        dispatch(removeWorkspace(id))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete workspace'
        dispatch(setWorkspaceError(errorMsg))
        throw err
      } finally {
        dispatch(setWorkspaceLoading(false))
      }
    },
    [dispatch, workspaceService]
  )

  /**
   * Switch to different workspace
   */
  const switchWorkspace = useCallback(
    (id: string | null) => {
      dispatch(setCurrentWorkspace(id))
      if (id) {
        localStorage.setItem('currentWorkspaceId', id)
      } else {
        localStorage.removeItem('currentWorkspaceId')
      }
    },
    [dispatch]
  )

  return {
    // State
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    isLoading,
    error,
    isInitialized,

    // Actions
    loadWorkspaces,
    createWorkspace,
    updateWorkspace: updateWorkspaceData,
    deleteWorkspace,
    switchWorkspace,
  }
}

export default useWorkspace
