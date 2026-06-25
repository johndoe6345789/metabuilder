/**
 * useWorkspace Hook
 * Manages workspace state and operations
 *
 * Self-contained hook that uses Redux store internally
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setWorkspaces,
  addWorkspace as addWorkspaceAction,
  updateWorkspace as updateWorkspaceAction,
  removeWorkspace,
  setCurrentWorkspace,
  setWorkspaceLoading,
  setWorkspaceError,
} from '@metabuilder/redux-slices';
import type { Workspace } from '@metabuilder/types';
import { useUINotifications } from './ui/useUINotifications';

const dbalUrl = () =>
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DBAL_API_URL) ||
  'http://localhost:8080'

async function dbalFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${dbalUrl()}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`DBAL ${res.status}`)
  const json = await res.json() as Record<string, unknown>
  return ('data' in json ? json.data : json) as T
}

// Re-export Workspace type for consumers
export type { Workspace } from '@metabuilder/types';

/** Create workspace request */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  tenantId?: string;
  color?: string;
  [key: string]: any;
}

/** Update workspace request */
export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  [key: string]: any;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface RootState {
  workspace: WorkspaceState;
}

/**
 * Self-contained workspace hook with Redux integration
 */
export function useWorkspace() {
  const dispatch = useDispatch();
  const { success, error: showError } = useUINotifications();

  // Redux state selectors
  const workspaces = useSelector((state: RootState) => state.workspace?.workspaces ?? []);
  const currentWorkspace = useSelector((state: RootState) => state.workspace?.currentWorkspace ?? null);
  const currentWorkspaceId = useSelector((state: RootState) => state.workspace?.currentWorkspaceId ?? null);
  const isLoading = useSelector((state: RootState) => state.workspace?.isLoading ?? false);
  const error = useSelector((state: RootState) => state.workspace?.error ?? null);

  const [isInitialized, setIsInitialized] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const MAX_RETRIES = 3;

  const getTenantId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tenantId') || 'default';
    }
    return 'default';
  }, []);

  // Load workspaces from DBAL (stable ref — no state deps in callback)
  const loadWorkspaces = useCallback(async () => {
    dispatch(setWorkspaceLoading(true));
    try {
      const response = await dbalFetch<{ data: Workspace[]; total: number }>('GET', 'default/core/workspace');

      if (response && response.data) {
        const loadedWorkspaces = response.data;
        dispatch(setWorkspaces(loadedWorkspaces));

        // Set default current workspace if not set
        const storedId = typeof window !== 'undefined'
          ? localStorage.getItem('currentWorkspaceId')
          : null;
        if (!storedId && loadedWorkspaces.length > 0) {
          dispatch(setCurrentWorkspace(loadedWorkspaces[0].id));
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentWorkspaceId', loadedWorkspaces[0].id);
          }
        }
      } else {
        dispatch(setWorkspaces([]));
      }

      dispatch(setWorkspaceError(null));
      retryCountRef.current = 0;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load workspaces';
      dispatch(setWorkspaceError(errorMsg));
      console.error('Failed to load workspaces:', err);

      // Exponential backoff retry (max 3 attempts)
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 16000);
        retryCountRef.current += 1;
        console.log(`[workspace] Retry ${retryCountRef.current}/${MAX_RETRIES} in ${delay}ms`);
        retryTimerRef.current = setTimeout(() => { loadWorkspaces(); }, delay);
      }
    } finally {
      dispatch(setWorkspaceLoading(false));
    }
  }, [dispatch]);

  // Load workspaces once on mount
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      loadWorkspaces();
    }
    return () => { clearTimeout(retryTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create workspace
  const createWorkspace = useCallback(
    async (data: CreateWorkspaceRequest): Promise<Workspace> => {
      dispatch(setWorkspaceLoading(true));
      try {
        const tenantId = getTenantId();
        const workspaceData = {
          name: data.name,
          description: data.description || '',
          tenantId,
          color: data.color || '#1976d2',
        };

        const response = await dbalFetch<Workspace>('POST', 'default/core/workspace', workspaceData);

        if (!response) {
          throw new Error('Failed to create workspace - no response');
        }

        dispatch(addWorkspaceAction(response));
        success(`Workspace "${data.name}" created successfully!`);
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create workspace';
        dispatch(setWorkspaceError(errorMsg));
        showError(errorMsg);
        console.error('Failed to create workspace:', err);
        throw err;
      } finally {
        dispatch(setWorkspaceLoading(false));
      }
    },
    [dispatch, getTenantId, success, showError]
  );

  // Update workspace
  const updateWorkspaceData = useCallback(
    async (id: string, data: UpdateWorkspaceRequest): Promise<Workspace> => {
      dispatch(setWorkspaceLoading(true));
      try {
        const response = await dbalFetch<Workspace>('PUT', `default/core/workspace/${id}`, data);

        if (!response) {
          throw new Error('Failed to update workspace - no response');
        }

        dispatch(updateWorkspaceAction(response));
        success('Workspace updated successfully!');
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update workspace';
        dispatch(setWorkspaceError(errorMsg));
        showError(errorMsg);
        console.error('Failed to update workspace:', err);
        throw err;
      } finally {
        dispatch(setWorkspaceLoading(false));
      }
    },
    [dispatch, success, showError]
  );

  // Delete workspace
  const deleteWorkspace = useCallback(
    async (id: string) => {
      dispatch(setWorkspaceLoading(true));
      try {
        await dbalFetch<void>('DELETE', `default/core/workspace/${id}`);
        dispatch(removeWorkspace(id));
        success('Workspace deleted successfully!');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete workspace';
        dispatch(setWorkspaceError(errorMsg));
        showError(errorMsg);
        console.error('Failed to delete workspace:', err);
        throw err;
      } finally {
        dispatch(setWorkspaceLoading(false));
      }
    },
    [dispatch, success, showError]
  );

  // Switch workspace
  const switchWorkspace = useCallback(
    (id: string | null) => {
      dispatch(setCurrentWorkspace(id));
      if (typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem('currentWorkspaceId', id);
        } else {
          localStorage.removeItem('currentWorkspaceId');
        }
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
    isInitialized,

    // Actions
    loadWorkspaces,
    createWorkspace,
    updateWorkspace: updateWorkspaceData,
    deleteWorkspace,
    switchWorkspace,
  };
}

export default useWorkspace;
