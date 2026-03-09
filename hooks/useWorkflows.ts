/**
 * useWorkflows Hook
 * Manages workflow list via DBAL REST API + Redux (persisted to IndexedDB via redux-persist)
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUINotifications } from './ui/useUINotifications';
import {
  setWorkflows,
  addWorkflowToList,
  updateWorkflowInList,
  removeWorkflowFromList,
  setWorkflowsLoading,
  setWorkflowsError,
  selectWorkflows,
  selectWorkflowsIsLoading,
  selectWorkflowsError,
  type WorkflowsState,
} from '@metabuilder/redux-slices';

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

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  version?: string;
  category?: string;
  status?: 'draft' | 'active';
  nodes?: unknown[];
  connections?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  version?: string;
  category?: string;
  status?: string;
  nodes?: unknown[];
  connections?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isPublished?: boolean;
}

export interface ListWorkflowsOptions {
  status?: string;
  category?: string;
  isPublished?: boolean;
  limit?: number;
  page?: number;
}

interface RootState {
  workflows: WorkflowsState;
}

export function useWorkflows() {
  const dispatch = useDispatch();
  const { success, error: showError } = useUINotifications();

  const workflows = useSelector((state: RootState) => selectWorkflows(state));
  const isLoading = useSelector((state: RootState) => selectWorkflowsIsLoading(state));
  const error = useSelector((state: RootState) => selectWorkflowsError(state));

  const getTenantId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tenantId') || 'default';
    }
    return 'default';
  }, []);

  const listWorkflows = useCallback(
    async (options: ListWorkflowsOptions = {}): Promise<void> => {
      dispatch(setWorkflowsLoading(true));
      dispatch(setWorkflowsError(null));
      try {
        const params: Record<string, string> = {};
        if (options.status) params.status = options.status;
        if (options.category) params.category = options.category;
        if (options.isPublished !== undefined) params.isPublished = String(options.isPublished);
        if (options.limit) params.limit = String(options.limit);
        if (options.page) params.page = String(options.page);

        const qs = new URLSearchParams(params).toString()
        const response = await dbalFetch<{ data: unknown[]; total: number }>(
          'GET', `default/core/workflow${qs ? `?${qs}` : ''}`
        );

        dispatch(setWorkflows((response?.data ?? []) as Parameters<typeof setWorkflows>[0]));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load workflows';
        dispatch(setWorkflowsError(errorMsg));
        console.error('Failed to load workflows:', err);
      } finally {
        dispatch(setWorkflowsLoading(false));
      }
    },
    [dispatch]
  );

  const getWorkflow = useCallback(
    async (id: string): Promise<unknown | null> => {
      try {
        return await dbalFetch<unknown>('GET', `default/core/workflow/${id}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load workflow';
        dispatch(setWorkflowsError(errorMsg));
        console.error('Failed to load workflow:', err);
        return null;
      }
    },
    [dispatch]
  );

  const createWorkflow = useCallback(
    async (data: CreateWorkflowRequest): Promise<unknown | null> => {
      dispatch(setWorkflowsLoading(true));
      dispatch(setWorkflowsError(null));
      try {
        const generateId = (name: string): string => {
          const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
          return `workflow_${base}_${Date.now()}`;
        };

        const now = Date.now();
        const workflowData = {
          id: generateId(data.name),
          name: data.name,
          description: data.description || '',
          version: data.version || '1.0.0',
          category: data.category || 'custom',
          status: data.status || 'draft',
          nodes: data.nodes || [],
          connections: data.connections || {},
          metadata: data.metadata || {},
          isPublished: false,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
          tenantId: getTenantId(),
        };

        const response = await dbalFetch<unknown>('POST', 'default/core/workflow', workflowData);
        if (response) {
          dispatch(addWorkflowToList(response as Parameters<typeof addWorkflowToList>[0]));
          success(`Workflow "${data.name}" created successfully!`);
        }
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create workflow';
        dispatch(setWorkflowsError(errorMsg));
        showError(errorMsg);
        console.error('Failed to create workflow:', err);
        return null;
      } finally {
        dispatch(setWorkflowsLoading(false));
      }
    },
    [dispatch, getTenantId, success, showError]
  );

  const updateWorkflow = useCallback(
    async (id: string, data: UpdateWorkflowRequest): Promise<unknown | null> => {
      dispatch(setWorkflowsLoading(true));
      dispatch(setWorkflowsError(null));
      try {
        const response = await dbalFetch<unknown>('PUT', `default/core/workflow/${id}`, data);
        if (response) {
          dispatch(updateWorkflowInList(response as Parameters<typeof updateWorkflowInList>[0]));
          success('Workflow updated successfully!');
        }
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update workflow';
        dispatch(setWorkflowsError(errorMsg));
        showError(errorMsg);
        console.error('Failed to update workflow:', err);
        return null;
      } finally {
        dispatch(setWorkflowsLoading(false));
      }
    },
    [dispatch, success, showError]
  );

  const deleteWorkflow = useCallback(
    async (id: string): Promise<boolean> => {
      dispatch(setWorkflowsLoading(true));
      dispatch(setWorkflowsError(null));
      try {
        await dbalFetch<void>('DELETE', `default/core/workflow/${id}`);
        dispatch(removeWorkflowFromList(id));
        success('Workflow deleted successfully!');
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete workflow';
        dispatch(setWorkflowsError(errorMsg));
        showError(errorMsg);
        console.error('Failed to delete workflow:', err);
        return false;
      } finally {
        dispatch(setWorkflowsLoading(false));
      }
    },
    [dispatch, success, showError]
  );

  const executeWorkflow = useCallback(
    async (id: string): Promise<{ executionId: string; status: string } | null> => {
      try {
        // TODO: Once execution engine is implemented, make actual API call
        const executionId = `exec_${id}_${Date.now()}`;
        console.log('Simulated workflow execution:', { id, executionId });
        return { executionId, status: 'simulated' };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to execute workflow';
        dispatch(setWorkflowsError(errorMsg));
        console.error('Failed to execute workflow:', err);
        return null;
      }
    },
    [dispatch]
  );

  return {
    workflows,
    isLoading,
    error,
    listWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
  };
}

export default useWorkflows;
