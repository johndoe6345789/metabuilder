/**
 * useWorkspace Hook
 * Manages workspace state and operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
  setWorkspaces,
  addWorkspace,
  updateWorkspace,
  removeWorkspace,
  setCurrentWorkspace,
  setLoading,
  setError,
  selectWorkspaces,
  selectCurrentWorkspace,
  selectCurrentWorkspaceId,
  selectWorkspaceIsLoading,
  selectWorkspaceError
} from '../store/slices/workspaceSlice';
import workspaceService from '../services/workspaceService';
import { workspaceDB } from '../db/schema';
import { Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest } from '../types/project';
import { useUI } from './useUI';

export function useWorkspace() {
  const dispatch = useDispatch<AppDispatch>();
  const { error: showError, success: showSuccess } = useUI();
  const [isInitialized, setIsInitialized] = useState(false);

  // Selectors
  const workspaces = useSelector((state: RootState) => selectWorkspaces(state));
  const currentWorkspace = useSelector((state: RootState) => selectCurrentWorkspace(state));
  const currentWorkspaceId = useSelector((state: RootState) => selectCurrentWorkspaceId(state));
  const isLoading = useSelector((state: RootState) => selectWorkspaceIsLoading(state));
  const error = useSelector((state: RootState) => selectWorkspaceError(state));

  // Get tenant ID from localStorage or default
  const getTenantId = useCallback(() => {
    return localStorage.getItem('tenantId') || 'default';
  }, []);

  // Load workspaces on mount
  useEffect(() => {
    if (!isInitialized) {
      loadWorkspaces();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Load workspaces from server
  const loadWorkspaces = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const tenantId = getTenantId();
      const response = await workspaceService.listWorkspaces(tenantId);
      dispatch(setWorkspaces(response.workspaces));

      // Cache in IndexedDB
      await Promise.all(response.workspaces.map((ws) => workspaceDB.update(ws)));

      // Set default current workspace if not set
      if (!currentWorkspaceId && response.workspaces.length > 0) {
        dispatch(setCurrentWorkspace(response.workspaces[0].id));
        localStorage.setItem('currentWorkspaceId', response.workspaces[0].id);
      }

      dispatch(setError(null));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load workspaces';
      dispatch(setError(errorMsg));
      showError(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, getTenantId, currentWorkspaceId, showError]);

  // Create workspace
  const createWorkspace = useCallback(
    async (data: CreateWorkspaceRequest) => {
      dispatch(setLoading(true));
      try {
        const tenantId = getTenantId();
        const workspace = await workspaceService.createWorkspace({
          ...data,
          tenantId
        });

        dispatch(addWorkspace(workspace));
        await workspaceDB.create(workspace);

        showSuccess(`Workspace "${workspace.name}" created successfully`);
        return workspace;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create workspace';
        dispatch(setError(errorMsg));
        showError(errorMsg);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, getTenantId, showError, showSuccess]
  );

  // Update workspace
  const updateWorkspaceData = useCallback(
    async (id: string, data: UpdateWorkspaceRequest) => {
      dispatch(setLoading(true));
      try {
        const updated = await workspaceService.updateWorkspace(id, data);
        dispatch(updateWorkspace(updated));
        await workspaceDB.update(updated);

        showSuccess(`Workspace "${updated.name}" updated successfully`);
        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update workspace';
        dispatch(setError(errorMsg));
        showError(errorMsg);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, showError, showSuccess]
  );

  // Delete workspace
  const deleteWorkspace = useCallback(
    async (id: string) => {
      dispatch(setLoading(true));
      try {
        await workspaceService.deleteWorkspace(id);
        dispatch(removeWorkspace(id));
        await workspaceDB.delete(id);

        showSuccess('Workspace deleted successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete workspace';
        dispatch(setError(errorMsg));
        showError(errorMsg);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, showError, showSuccess]
  );

  // Switch workspace
  const switchWorkspace = useCallback(
    (id: string | null) => {
      dispatch(setCurrentWorkspace(id));
      if (id) {
        localStorage.setItem('currentWorkspaceId', id);
      } else {
        localStorage.removeItem('currentWorkspaceId');
      }
    },
    [dispatch]
  );

  return {
    // State
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    isLoading,
    error,

    // Actions
    loadWorkspaces,
    createWorkspace,
    updateWorkspace: updateWorkspaceData,
    deleteWorkspace,
    switchWorkspace
  };
}

export default useWorkspace;
