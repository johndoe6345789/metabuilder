/**
 * Workflow types for the services package
 */

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourcePort?: string
  targetPort?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  version: string
  tenantId: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface NodeExecutionResult {
  nodeId: string
  status: 'success' | 'error' | 'skipped'
  output?: unknown
  error?: { code: string; message: string }
  startTime: number
  endTime: number
}

export interface ExecutionResult {
  id: string
  workflowId: string
  workflowName: string
  tenantId: string
  status: 'running' | 'success' | 'error' | 'cancelled'
  startTime: number
  endTime?: number
  nodes: NodeExecutionResult[]
  output?: unknown
  error?: { code: string; message: string }
}
