/**
 * Mock Service Adapter Implementations
 *
 * These adapters implement the service interfaces using in-memory storage.
 * Perfect for testing and development without requiring a backend server.
 */

import {
  IProjectServiceAdapter,
  IWorkspaceServiceAdapter,
  IWorkflowServiceAdapter,
  IExecutionServiceAdapter,
  IAuthServiceAdapter,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  ProjectCanvasItem,
  CreateCanvasItemRequest,
  UpdateCanvasItemRequest,
  Workflow,
  ExecutionResult,
  ExecutionStats,
  AuthResponse,
  User,
} from '../types'

/**
 * MockProjectServiceAdapter
 *
 * In-memory implementation of project operations.
 */
export class MockProjectServiceAdapter implements IProjectServiceAdapter {
  private projects: Map<string, Project> = new Map()
  private canvasItems: Map<string, ProjectCanvasItem> = new Map()

  async listProjects(tenantId: string, workspaceId?: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      p => p.tenantId === tenantId && (!workspaceId || p.workspaceId === workspaceId)
    )
  }

  async getProject(id: string): Promise<Project> {
    const project = this.projects.get(id)
    if (!project) throw new Error('Project not found')
    return { ...project }
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const project: Project = {
      id,
      name: data.name,
      description: data.description,
      workspaceId: data.workspaceId,
      tenantId: data.tenantId || 'default-tenant',
      color: data.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.projects.set(project.id, project)
    return { ...project }
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const project = await this.getProject(id)
    const updated = { ...project, ...data, updatedAt: Date.now() }
    this.projects.set(id, updated)
    return { ...updated }
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.projects.has(id)) throw new Error('Project not found')
    this.projects.delete(id)
  }

  async getCanvasItems(projectId: string): Promise<ProjectCanvasItem[]> {
    return Array.from(this.canvasItems.values())
      .filter(item => item.projectId === projectId)
      .map(item => ({ ...item }))
  }

  async createCanvasItem(projectId: string, data: CreateCanvasItemRequest): Promise<ProjectCanvasItem> {
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const existingItems = Array.from(this.canvasItems.values()).filter(i => i.projectId === projectId)
    const maxZIndex = existingItems.length > 0 ? Math.max(...existingItems.map(i => i.zIndex)) : 0
    const item: ProjectCanvasItem = {
      id,
      projectId,
      workflowId: data.workflowId,
      position: data.position,
      size: data.size || { width: 200, height: 150 },
      zIndex: maxZIndex + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.canvasItems.set(item.id, item)
    return { ...item }
  }

  async updateCanvasItem(
    projectId: string,
    itemId: string,
    data: UpdateCanvasItemRequest
  ): Promise<ProjectCanvasItem> {
    const item = this.canvasItems.get(itemId)
    if (!item || item.projectId !== projectId) throw new Error('Canvas item not found')
    const updated = { ...item, ...data, updatedAt: Date.now() }
    this.canvasItems.set(itemId, updated)
    return { ...updated }
  }

  async deleteCanvasItem(projectId: string, itemId: string): Promise<void> {
    const item = this.canvasItems.get(itemId)
    if (!item || item.projectId !== projectId) throw new Error('Canvas item not found')
    this.canvasItems.delete(itemId)
  }

  async bulkUpdateCanvasItems(
    projectId: string,
    updates: Array<Partial<ProjectCanvasItem> & { id: string }>
  ): Promise<ProjectCanvasItem[]> {
    const results: ProjectCanvasItem[] = []
    for (const update of updates) {
      const item = this.canvasItems.get(update.id)
      if (item && item.projectId === projectId) {
        const updated = { ...item, ...update, updatedAt: Date.now() }
        this.canvasItems.set(update.id, updated)
        results.push({ ...updated })
      }
    }
    return results
  }
}

/**
 * MockWorkspaceServiceAdapter
 *
 * In-memory implementation of workspace operations.
 */
export class MockWorkspaceServiceAdapter implements IWorkspaceServiceAdapter {
  private workspaces: Map<string, Workspace> = new Map()

  async listWorkspaces(tenantId: string): Promise<Workspace[]> {
    return Array.from(this.workspaces.values())
      .filter(w => w.tenantId === tenantId)
      .map(w => ({ ...w }))
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const workspace = this.workspaces.get(id)
    if (!workspace) throw new Error('Workspace not found')
    return { ...workspace }
  }

  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const id = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const workspace: Workspace = {
      id,
      name: data.name,
      description: data.description,
      tenantId: data.tenantId || 'default-tenant',
      color: data.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.workspaces.set(workspace.id, workspace)
    return { ...workspace }
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const workspace = await this.getWorkspace(id)
    const updated = { ...workspace, ...data, updatedAt: Date.now() }
    this.workspaces.set(id, updated)
    return { ...updated }
  }

  async deleteWorkspace(id: string): Promise<void> {
    if (!this.workspaces.has(id)) throw new Error('Workspace not found')
    this.workspaces.delete(id)
  }
}

/**
 * MockWorkflowServiceAdapter
 *
 * In-memory implementation of workflow operations.
 */
export class MockWorkflowServiceAdapter implements IWorkflowServiceAdapter {
  private workflows: Map<string, Workflow> = new Map()

  async createWorkflow(data: { name: string; description?: string; tenantId: string }): Promise<Workflow> {
    const id = `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const workflow: Workflow = {
      id,
      ...data,
      version: '1.0.0',
      nodes: [],
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.workflows.set(workflow.id, workflow)
    return { ...workflow }
  }

  async getWorkflow(workflowId: string, tenantId: string): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || workflow.tenantId !== tenantId) return undefined
    return { ...workflow }
  }

  async listWorkflows(tenantId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values())
      .filter(w => w.tenantId === tenantId)
      .map(w => ({ ...w }))
  }

  async saveWorkflow(workflow: Workflow): Promise<void> {
    if (!this.workflows.has(workflow.id)) throw new Error('Workflow not found')
    this.workflows.set(workflow.id, { ...workflow, updatedAt: Date.now() })
  }

  async deleteWorkflow(workflowId: string, tenantId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || workflow.tenantId !== tenantId) throw new Error('Workflow not found')
    this.workflows.delete(workflowId)
  }

  async validateWorkflow(workflowId: string, workflow: Workflow) {
    const errors: string[] = []
    if (workflow.nodes.length === 0) errors.push('Workflow must have at least one node')
    if (!workflow.name) errors.push('Workflow must have a name')
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    }
  }

  async getWorkflowMetrics(workflow: Workflow): Promise<{
    nodeCount: number;
    connectionCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
    depth: number;
  }> {
    const complexity: 'simple' | 'moderate' | 'complex' =
      workflow.nodes.length > 20 ? 'complex' : workflow.nodes.length > 5 ? 'moderate' : 'simple'
    return {
      nodeCount: workflow.nodes.length,
      connectionCount: workflow.connections.length,
      complexity,
      depth: 1,
    }
  }
}

/**
 * MockExecutionServiceAdapter
 *
 * In-memory implementation of execution operations.
 */
export class MockExecutionServiceAdapter implements IExecutionServiceAdapter {
  private executions: Map<string, ExecutionResult> = new Map()

  async executeWorkflow(
    workflowId: string,
    data: { nodes: any[]; connections: any[]; inputs?: Record<string, any> },
    tenantId?: string
  ): Promise<ExecutionResult> {
    const id = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()
    const endTime = startTime + 1000
    const execution: ExecutionResult = {
      id,
      workflowId,
      workflowName: 'Test Workflow',
      status: 'success',
      startTime,
      endTime,
      duration: endTime - startTime,
      nodes: data.nodes.map(node => ({
        nodeId: node.id,
        nodeName: node.name || node.type,
        status: 'success' as const,
        startTime,
        endTime,
        duration: endTime - startTime,
        output: {},
      })),
      input: data.inputs,
      output: {},
      tenantId: tenantId || 'test-tenant',
    }
    this.executions.set(execution.id, execution)
    return { ...execution }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (execution) {
      execution.status = 'cancelled'
      execution.endTime = Date.now()
    }
  }

  async getExecutionDetails(executionId: string): Promise<ExecutionResult | null> {
    const execution = this.executions.get(executionId)
    return execution ? { ...execution } : null
  }

  async getExecutionStats(workflowId: string, tenantId?: string): Promise<ExecutionStats> {
    const executions = Array.from(this.executions.values()).filter(e => e.workflowId === workflowId)
    const successful = executions.filter(e => e.status === 'success')
    const failed = executions.filter(e => e.status === 'error')

    const durations = successful.map(e => (e.endTime || 0) - e.startTime)
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const lastExecution = executions[executions.length - 1]

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageDuration: avgDuration,
      lastExecutionTime: lastExecution?.endTime,
    }
  }

  async getExecutionHistory(
    workflowId: string,
    tenantId?: string,
    limit: number = 50
  ): Promise<ExecutionResult[]> {
    return Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId)
      .slice(-limit)
      .map(e => ({ ...e }))
  }
}

/**
 * MockAuthServiceAdapter
 *
 * In-memory implementation of authentication operations.
 */
export class MockAuthServiceAdapter implements IAuthServiceAdapter {
  private currentUser: User | null = null
  private currentToken: string | null = null
  private users: Map<string, { user: User; password: string }> = new Map()

  async login(email: string, password: string): Promise<AuthResponse> {
    const userEntry = this.users.get(email)
    if (!userEntry || userEntry.password !== password) {
      throw new Error('Invalid email or password')
    }
    this.currentUser = userEntry.user
    this.currentToken = `token-${Date.now()}`
    return {
      success: true,
      user: { ...this.currentUser },
      token: this.currentToken,
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    if (this.users.has(email)) {
      throw new Error('User already exists')
    }
    const id = `user-${Date.now()}`
    const user: User = {
      id,
      email,
      name,
    }
    this.users.set(email, { user, password })
    this.currentUser = user
    this.currentToken = `token-${Date.now()}`
    return {
      success: true,
      user: { ...user },
      token: this.currentToken,
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null
    this.currentToken = null
  }

  async getCurrentUser(): Promise<User> {
    if (!this.currentUser) throw new Error('Not authenticated')
    return { ...this.currentUser }
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentToken
  }

  getToken(): string | null {
    return this.currentToken
  }

  getUser(): User | null {
    return this.currentUser ? { ...this.currentUser } : null
  }
}
