/**
 * Service Adapter Types
 *
 * Re-exports canonical types from @metabuilder/types and defines
 * adapter-specific interfaces for service implementations.
 */

// ============================================================================
// RE-EXPORTED CANONICAL TYPES
// ============================================================================

// Workflow types from canonical source
export type {
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  ExecutionResult,
  ExecutionStats,
  ExecutionStatus,
  NodeExecutionResult,
} from '@metabuilder/types';

// Project types from canonical source
export type {
  Project,
  Workspace,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  ProjectCanvasItem,
  CanvasPosition,
  CanvasSize,
  ProjectCanvasState,
} from '@metabuilder/types';

// ============================================================================
// ADAPTER-SPECIFIC TYPES
// ============================================================================

/**
 * Request to create a canvas item (adapter-specific, minimal fields)
 */
export interface CreateCanvasItemRequest {
  workflowId: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

/**
 * Request to update a canvas item (adapter-specific, partial updates)
 */
export interface UpdateCanvasItemRequest {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

/**
 * User entity for authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

// ============================================================================
// SERVICE ADAPTER INTERFACES
// ============================================================================

import type {
  Project,
  Workspace,
  Workflow,
  ExecutionResult,
  ExecutionStats,
  ProjectCanvasItem,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '@metabuilder/types';

export interface IProjectServiceAdapter {
  listProjects(tenantId: string, workspaceId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
  createProject(data: CreateProjectRequest): Promise<Project>;
  updateProject(id: string, data: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getCanvasItems(projectId: string): Promise<ProjectCanvasItem[]>;
  createCanvasItem(projectId: string, data: CreateCanvasItemRequest): Promise<ProjectCanvasItem>;
  updateCanvasItem(projectId: string, itemId: string, data: UpdateCanvasItemRequest): Promise<ProjectCanvasItem>;
  deleteCanvasItem(projectId: string, itemId: string): Promise<void>;
  bulkUpdateCanvasItems(projectId: string, updates: Array<Partial<ProjectCanvasItem> & { id: string }>): Promise<ProjectCanvasItem[]>;
}

export interface IWorkspaceServiceAdapter {
  listWorkspaces(tenantId: string): Promise<Workspace[]>;
  getWorkspace(id: string): Promise<Workspace>;
  createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace>;
  updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
}

export interface IWorkflowServiceAdapter {
  createWorkflow(data: { name: string; description?: string; tenantId: string }): Promise<Workflow>;
  getWorkflow(workflowId: string, tenantId: string): Promise<Workflow | undefined>;
  listWorkflows(tenantId: string): Promise<Workflow[]>;
  saveWorkflow(workflow: Workflow): Promise<void>;
  deleteWorkflow(workflowId: string, tenantId: string): Promise<void>;
  validateWorkflow(
    workflowId: string,
    workflow: Workflow
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  getWorkflowMetrics(workflow: Workflow): Promise<{
    nodeCount: number;
    connectionCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
    depth: number;
  }>;
}

export interface IExecutionServiceAdapter {
  executeWorkflow(
    workflowId: string,
    data: {
      nodes: any[];
      connections: any[];
      inputs?: Record<string, any>;
    },
    tenantId?: string
  ): Promise<ExecutionResult>;
  cancelExecution(executionId: string): Promise<void>;
  getExecutionDetails(executionId: string): Promise<ExecutionResult | null>;
  getExecutionStats(workflowId: string, tenantId?: string): Promise<ExecutionStats>;
  getExecutionHistory(workflowId: string, tenantId?: string, limit?: number): Promise<ExecutionResult[]>;
}

export interface IAuthServiceAdapter {
  login(email: string, password: string): Promise<AuthResponse>;
  register(email: string, password: string, name: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  isAuthenticated(): boolean;
  getToken(): string | null;
  getUser(): User | null;
}

// ============================================================================
// SERVICE PROVIDER CONTAINER
// ============================================================================

export interface IServiceProviders {
  projectService: IProjectServiceAdapter;
  workspaceService: IWorkspaceServiceAdapter;
  workflowService: IWorkflowServiceAdapter;
  executionService: IExecutionServiceAdapter;
  authService: IAuthServiceAdapter;
}
