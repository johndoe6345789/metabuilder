/**
 * Service Adapter Types
 * Minimal, framework-agnostic interfaces for all service dependencies
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  workspaceId: string;
  tenantId: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  tenantId: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface ProjectCanvasItem {
  id: string;
  projectId: string;
  workflowId: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  createdAt: number;
  updatedAt: number;
}

export interface CreateCanvasItemRequest {
  workflowId: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface UpdateCanvasItemRequest {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowConnection {
  id?: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  tenantId: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ExecutionResult {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'error' | 'stopped' | 'cancelled';
  startTime: number;
  endTime?: number;
  nodes: any[];
  output?: any;
  error?: any;
  tenantId: string;
}

export interface ExecutionStats {
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  averageDuration: number;
  lastExecution?: ExecutionResult;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

// ============================================================================
// SERVICE ADAPTER INTERFACES
// ============================================================================

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
