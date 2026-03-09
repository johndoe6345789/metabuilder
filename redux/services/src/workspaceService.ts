/**
 * Workspace Service
 * API client for workspace management
 */

import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceListResponse
} from '../types/project';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper to make API requests
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { retries?: number; params?: Record<string, any> } = {}
): Promise<T> {
  const { retries = 3, params, ...init } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url = `${url}?${queryString}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        },
        ...init
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const error = new Error(errorData.error?.message || errorData.error || 'API Error');
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < retries - 1 && !(error as any).status) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export const workspaceService = {
  /**
   * List all workspaces for tenant
   */
  async listWorkspaces(tenantId: string, limit = 50, offset = 0): Promise<any> {
    try {
      return await apiRequest('/workspaces', {
        params: {
          tenantId,
          limit,
          offset
        }
      });
    } catch (error) {
      console.error('Failed to list workspaces:', error);
      throw error;
    }
  },

  /**
   * Get specific workspace
   */
  async getWorkspace(id: string): Promise<Workspace> {
    try {
      return await apiRequest<Workspace>(`/workspaces/${id}`);
    } catch (error) {
      console.error(`Failed to get workspace ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new workspace
   */
  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    try {
      return await apiRequest<Workspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  },

  /**
   * Update workspace
   */
  async updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    try {
      return await apiRequest<Workspace>(`/workspaces/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Failed to update workspace ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete workspace
   */
  async deleteWorkspace(id: string): Promise<void> {
    try {
      await apiRequest(`/workspaces/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Failed to delete workspace ${id}:`, error);
      throw error;
    }
  }
};

export default workspaceService;
