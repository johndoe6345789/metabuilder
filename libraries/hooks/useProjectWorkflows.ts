/**
 * useProjectWorkflows Hook
 * Manages workflows within a project using the C++ DBAL REST API.
 */

import { useCallback, useEffect, useState } from 'react';

const dbalUrl = () =>
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DBAL_API_URL) ||
  'http://localhost:8080'

async function dbalFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${dbalUrl()}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`DBAL ${res.status}`);
  const json = await res.json() as Record<string, unknown>
  return ('data' in json ? json.data : json) as T
}

export interface ProjectWorkflow {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
  status: 'draft' | 'published' | 'deprecated' | 'active' | 'paused';
  lastModified: number;
  category?: string;
  version?: string;
  isPublished?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

interface UseProjectWorkflowsOptions {
  projectId: string;
  autoLoad?: boolean;
  /** Tenant ID (defaults to localStorage value or 'default') */
  tenant?: string;
  /** Package ID (defaults to 'core') */
  packageId?: string;
}

/**
 * Hook for managing workflows within a project via the DBAL REST API.
 * Project-scoped: uses local state (not Redux) since results are filtered by projectId.
 */
export function useProjectWorkflows(options: UseProjectWorkflowsOptions) {
  const { projectId, autoLoad = true } = options;
  const [workflows, setWorkflowsState] = useState<ProjectWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenant =
    options.tenant ??
    (typeof window !== 'undefined' ? localStorage.getItem('tenantId') ?? 'default' : 'default');
  const packageId = options.packageId ?? 'core';
  const base = `${tenant}/${packageId}/workflow`;

  /**
   * Fetch workflows for the current project from DBAL REST API
   */
  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams({ isArchived: 'false', projectId }).toString();
      const result = await dbalFetch<{ data: Record<string, unknown>[] }>(
        'GET', `${base}?${qs}`
      );

      const transformed: ProjectWorkflow[] = (result?.data ?? []).map((workflow) => ({
        id: workflow.id as string,
        name: workflow.name as string,
        description: workflow.description as string | undefined,
        nodeCount: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
        status: workflow.status as ProjectWorkflow['status'],
        lastModified: workflow.updatedAt
          ? new Date(workflow.updatedAt as string).getTime()
          : Date.now(),
        category: workflow.category as string | undefined,
        version: workflow.version as string | undefined,
        isPublished: workflow.isPublished as boolean | undefined,
        createdAt: workflow.createdAt
          ? new Date(workflow.createdAt as string).getTime()
          : undefined,
        updatedAt: workflow.updatedAt
          ? new Date(workflow.updatedAt as string).getTime()
          : undefined,
      }));

      setWorkflowsState(transformed);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load workflows';
      setError(errorMsg);
      console.error('Failed to load project workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, base]);

  /**
   * Create a new workflow via DBAL REST API
   */
  const createWorkflow = useCallback(
    async (data: {
      name: string;
      description?: string;
      category?: string;
    }): Promise<ProjectWorkflow | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const workflow = await dbalFetch<Record<string, unknown>>('POST', base, {
          name: data.name,
          description: data.description || '',
          version: '1.0.0',
          category: data.category || 'custom',
          status: 'draft',
          nodes: [
            {
              id: 'start',
              name: 'Start',
              type: 'frame.begin',
              typeVersion: 1,
              position: [0, 0],
              parameters: {},
            },
          ],
          connections: {},
          metadata: {},
          executionConfig: {},
          isPublished: false,
          isArchived: false,
        });

        const transformed: ProjectWorkflow = {
          id: workflow.id as string,
          name: workflow.name as string,
          description: workflow.description as string | undefined,
          nodeCount: 1,
          status: workflow.status as ProjectWorkflow['status'],
          lastModified: Date.now(),
          category: workflow.category as string | undefined,
          version: workflow.version as string | undefined,
          isPublished: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setWorkflowsState((prev) => [transformed, ...prev]);
        return transformed;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create workflow';
        setError(errorMsg);
        console.error('Failed to create workflow:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [base]
  );

  /**
   * Delete a workflow via DBAL REST API (soft delete via isArchived)
   */
  const deleteWorkflow = useCallback(
    async (workflowId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await dbalFetch<void>('PUT', `${base}/${workflowId}`, { isArchived: true });
        setWorkflowsState((prev) => prev.filter((w) => w.id !== workflowId));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete workflow';
        setError(errorMsg);
        console.error('Failed to delete workflow:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [base]
  );

  // Auto-load workflows on mount if enabled
  useEffect(() => {
    if (autoLoad && projectId) {
      loadWorkflows();
    }
  }, [autoLoad, projectId, loadWorkflows]);

  return {
    workflows,
    isLoading,
    error,
    loadWorkflows,
    createWorkflow,
    deleteWorkflow,
  };
}

export default useProjectWorkflows;
