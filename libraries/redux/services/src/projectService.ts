/**
 * Project Service
 * API client for project and canvas management
 */

import { api } from './api';
import type {
  Project,
  ProjectCanvasItem,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateCanvasItemRequest,
  UpdateCanvasItemRequest,
  BulkUpdateCanvasItemsRequest,
  ProjectListResponse,
  CanvasItemListResponse,
  BulkUpdateCanvasItemsResponse
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

export const projectService = {
  // ==========================================
  // Project Operations
  // ==========================================

  /**
   * List all projects
   */
  async listProjects(
    tenantId: string,
    workspaceId?: string,
    limit = 50,
    offset = 0
  ): Promise<any> {
    try {
      const params: any = {
        tenantId,
        limit,
        offset
      };
      if (workspaceId) {
        params.workspaceId = workspaceId;
      }

      return await apiRequest('/projects', { params });
    } catch (error) {
      console.error('Failed to list projects:', error);
      throw error;
    }
  },

  /**
   * Get specific project
   */
  async getProject(id: string): Promise<Project> {
    try {
      return await apiRequest<Project>(`/projects/${id}`);
    } catch (error) {
      console.error(`Failed to get project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new project
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      return await apiRequest<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },

  /**
   * Update project
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    try {
      return await apiRequest<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Failed to update project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await apiRequest(`/projects/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw error;
    }
  },

  // ==========================================
  // Canvas Item Operations
  // ==========================================

  /**
   * Get all canvas items for project
   */
  async getCanvasItems(projectId: string): Promise<any> {
    try {
      return await apiRequest(`/projects/${projectId}/canvas`);
    } catch (error) {
      console.error(`Failed to get canvas items for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Create canvas item
   */
  async createCanvasItem(projectId: string, data: CreateCanvasItemRequest): Promise<ProjectCanvasItem> {
    try {
      return await apiRequest<ProjectCanvasItem>(`/projects/${projectId}/canvas/items`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Failed to create canvas item in project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Update canvas item
   */
  async updateCanvasItem(
    projectId: string,
    itemId: string,
    data: UpdateCanvasItemRequest
  ): Promise<ProjectCanvasItem> {
    try {
      return await apiRequest<ProjectCanvasItem>(
        `/projects/${projectId}/canvas/items/${itemId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data)
        }
      );
    } catch (error) {
      console.error(`Failed to update canvas item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Delete canvas item
   */
  async deleteCanvasItem(projectId: string, itemId: string): Promise<void> {
    try {
      await apiRequest(`/projects/${projectId}/canvas/items/${itemId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Failed to delete canvas item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk update multiple canvas items
   */
  async bulkUpdateCanvasItems(
    projectId: string,
    data: BulkUpdateCanvasItemsRequest
  ): Promise<any> {
    try {
      return await apiRequest(`/projects/${projectId}/canvas/bulk-update`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Failed to bulk update canvas items in project ${projectId}:`, error);
      throw error;
    }
  }
};

export default projectService;
