import type { Workflow as GeneratedWorkflow } from '../types.generated'

export type Workflow = GeneratedWorkflow

export interface CreateWorkflowInput {
  id?: string
  name: string
  description?: string
  nodes: string
  edges: string
  enabled: boolean
  version?: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
  tenantId?: string | null
}

export interface UpdateWorkflowInput {
  name?: string
  description?: string
  nodes?: string
  edges?: string
  enabled?: boolean
  version?: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
  tenantId?: string | null
}
