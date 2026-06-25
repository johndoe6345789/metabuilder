/**
 * Default Service Adapter Implementations
 *
 * These adapters implement the service interfaces by wrapping HTTP calls
 * using the standard fetch API. They can be customized or replaced with
 * alternative implementations (e.g., GraphQL client, gRPC, etc.)
 */

import type {
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
  WorkflowNode,
  WorkflowConnection,
  ExecutionResult,
  ExecutionStats,
  AuthResponse,
  User,
} from '../types'

/**
 * DefaultProjectServiceAdapter
 *
 * Implements project operations via HTTP API calls.
 */
export class DefaultProjectServiceAdapter implements IProjectServiceAdapter {
  constructor(private apiBaseUrl: string = '/api') {}

  async listProjects(tenantId: string, workspaceId?: string): Promise<Project[]> {
    const params = new URLSearchParams({ tenantId })
    if (workspaceId) params.append('workspaceId', workspaceId)

    const response = await fetch(`${this.apiBaseUrl}/projects?${params}`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    const data = await response.json()
    return data.projects || []
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${id}`)
    if (!response.ok) throw new Error('Project not found')
    return response.json()
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await fetch(`${this.apiBaseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create project')
    return response.json()
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update project')
    return response.json()
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete project')
  }

  async getCanvasItems(projectId: string): Promise<ProjectCanvasItem[]> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/canvas`)
    if (!response.ok) throw new Error('Failed to fetch canvas items')
    const data = await response.json()
    return data.items || []
  }

  async createCanvasItem(projectId: string, data: CreateCanvasItemRequest): Promise<ProjectCanvasItem> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/canvas/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create canvas item')
    return response.json()
  }

  async updateCanvasItem(
    projectId: string,
    itemId: string,
    data: UpdateCanvasItemRequest
  ): Promise<ProjectCanvasItem> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/canvas/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update canvas item')
    return response.json()
  }

  async deleteCanvasItem(projectId: string, itemId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/canvas/items/${itemId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete canvas item')
  }

  async bulkUpdateCanvasItems(
    projectId: string,
    updates: Array<Partial<ProjectCanvasItem> & { id: string }>
  ): Promise<ProjectCanvasItem[]> {
    const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/canvas/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updates }),
    })
    if (!response.ok) throw new Error('Failed to bulk update canvas items')
    const data = await response.json()
    return data.items || []
  }
}

/**
 * DefaultWorkspaceServiceAdapter
 *
 * Implements workspace operations via HTTP API calls.
 */
export class DefaultWorkspaceServiceAdapter implements IWorkspaceServiceAdapter {
  constructor(private apiBaseUrl: string = '/api') {}

  async listWorkspaces(tenantId: string): Promise<Workspace[]> {
    const response = await fetch(`${this.apiBaseUrl}/workspaces?tenantId=${tenantId}`)
    if (!response.ok) throw new Error('Failed to fetch workspaces')
    const data = await response.json()
    return data.workspaces || []
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await fetch(`${this.apiBaseUrl}/workspaces/${id}`)
    if (!response.ok) throw new Error('Workspace not found')
    return response.json()
  }

  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await fetch(`${this.apiBaseUrl}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create workspace')
    return response.json()
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await fetch(`${this.apiBaseUrl}/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update workspace')
    return response.json()
  }

  async deleteWorkspace(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/workspaces/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete workspace')
  }
}

/**
 * DefaultWorkflowServiceAdapter
 *
 * Implements workflow operations via HTTP API calls.
 */
export class DefaultWorkflowServiceAdapter implements IWorkflowServiceAdapter {
  constructor(private apiBaseUrl: string = '/api') {}

  async createWorkflow(data: { name: string; description?: string; tenantId: string }): Promise<Workflow> {
    const response = await fetch(`${this.apiBaseUrl}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create workflow')
    return response.json()
  }

  async getWorkflow(workflowId: string, tenantId: string): Promise<Workflow | undefined> {
    const response = await fetch(`${this.apiBaseUrl}/workflows/${workflowId}?tenantId=${tenantId}`)
    if (response.status === 404) return undefined
    if (!response.ok) throw new Error('Failed to fetch workflow')
    return response.json()
  }

  async listWorkflows(tenantId: string): Promise<Workflow[]> {
    const response = await fetch(`${this.apiBaseUrl}/workflows?tenantId=${tenantId}`)
    if (!response.ok) throw new Error('Failed to fetch workflows')
    const data = await response.json()
    return data.workflows || []
  }

  async saveWorkflow(workflow: Workflow): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/workflows/${workflow.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    })
    if (!response.ok) throw new Error('Failed to save workflow')
  }

  async deleteWorkflow(workflowId: string, tenantId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/workflows/${workflowId}?tenantId=${tenantId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete workflow')
  }

  async validateWorkflow(
    workflowId: string,
    workflow: Workflow
  ): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const response = await fetch(`${this.apiBaseUrl}/workflows/${workflowId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    })
    if (!response.ok) throw new Error('Failed to validate workflow')
    return response.json()
  }

  async getWorkflowMetrics(
    workflow: Workflow
  ): Promise<{
    nodeCount: number
    connectionCount: number
    complexity: 'simple' | 'moderate' | 'complex'
    depth: number
  }> {
    return {
      nodeCount: workflow.nodes.length,
      connectionCount: workflow.connections.length,
      complexity: workflow.nodes.length > 20 ? 'complex' : workflow.nodes.length > 5 ? 'moderate' : 'simple',
      depth: this.calculateDepth(workflow),
    }
  }

  private calculateDepth(workflow: Workflow): number {
    // Simple depth calculation based on node connections
    // A more sophisticated implementation would do proper graph traversal
    const nodeIds = new Set(workflow.nodes.map((n: WorkflowNode) => n.id))
    let maxDepth = 0

    for (const connection of workflow.connections) {
      const depth = this.getNodeDepth(connection.target, workflow)
      maxDepth = Math.max(maxDepth, depth)
    }

    return maxDepth || 1
  }

  private getNodeDepth(nodeId: string, workflow: Workflow): number {
    const visited = new Set<string>()

    const traverse = (id: string): number => {
      if (visited.has(id)) return 0
      visited.add(id)

      const sources = workflow.connections
        .filter((c: WorkflowConnection) => c.target === id)
        .map((c: WorkflowConnection) => c.source)

      if (sources.length === 0) return 1
      return 1 + Math.max(...sources.map(traverse))
    }

    return traverse(nodeId)
  }
}

/**
 * DefaultExecutionServiceAdapter
 *
 * Implements execution operations via HTTP API calls.
 */
export class DefaultExecutionServiceAdapter implements IExecutionServiceAdapter {
  constructor(private apiBaseUrl: string = '/api') {}

  async executeWorkflow(
    workflowId: string,
    data: {
      nodes: any[]
      connections: any[]
      inputs?: Record<string, any>
    },
    tenantId?: string
  ): Promise<ExecutionResult> {
    const url = new URL(`${this.apiBaseUrl}/workflows/${workflowId}/execute`, window.location.origin)
    if (tenantId) url.searchParams.set('tenantId', tenantId)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to execute workflow')
    return response.json()
  }

  async cancelExecution(executionId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/executions/${executionId}/cancel`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to cancel execution')
  }

  async getExecutionDetails(executionId: string): Promise<ExecutionResult | null> {
    const response = await fetch(`${this.apiBaseUrl}/executions/${executionId}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error('Failed to fetch execution details')
    return response.json()
  }

  async getExecutionStats(workflowId: string, tenantId?: string): Promise<ExecutionStats> {
    const params = new URLSearchParams()
    if (tenantId) params.set('tenantId', tenantId)

    const response = await fetch(`${this.apiBaseUrl}/workflows/${workflowId}/execution-stats?${params}`)
    if (!response.ok) throw new Error('Failed to fetch execution stats')
    return response.json()
  }

  async getExecutionHistory(
    workflowId: string,
    tenantId?: string,
    limit: number = 50
  ): Promise<ExecutionResult[]> {
    const params = new URLSearchParams({ limit: Math.min(limit, 100).toString() })
    if (tenantId) params.set('tenantId', tenantId)

    const response = await fetch(`${this.apiBaseUrl}/workflows/${workflowId}/execution-history?${params}`)
    if (!response.ok) throw new Error('Failed to fetch execution history')
    const data = await response.json()
    return data.executions || []
  }
}

/**
 * DefaultAuthServiceAdapter
 *
 * Implements authentication operations via HTTP API calls.
 */
export class DefaultAuthServiceAdapter implements IAuthServiceAdapter {
  private token: string | null = null
  private user: User | null = null

  constructor(private apiBaseUrl: string = '/api') {
    // Restore from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('auth_user')
      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
        } catch {
          // Invalid JSON in storage
        }
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Login failed')

    const data: AuthResponse = await response.json()
    this.token = data.token
    this.user = data.user

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    }

    return data
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!response.ok) throw new Error('Registration failed')

    const data: AuthResponse = await response.json()
    this.token = data.token
    this.user = data.user

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    }

    return data
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/auth/logout`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    })
    if (!response.ok) throw new Error('Logout failed')

    this.token = null
    this.user = null

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.user) throw new Error('Not authenticated')
    return this.user
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user
  }

  getToken(): string | null {
    return this.token
  }

  getUser(): User | null {
    return this.user
  }
}
