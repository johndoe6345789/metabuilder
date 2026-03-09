/**
 * Request/Response Interfaces
 *
 * API request and response shapes for service operations.
 */

/**
 * Create project request
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  workspaceId: string;
  tenantId?: string;
  color?: string;
}

/**
 * Update project request
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  starred?: boolean;
  color?: string;
}

/**
 * Create workspace request
 */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  tenantId?: string;
  color?: string;
}

/**
 * Update workspace request
 */
export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  color?: string;
}
