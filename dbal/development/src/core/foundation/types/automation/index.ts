import type { Workflow as GeneratedWorkflow } from '../types.generated'

export type Workflow = GeneratedWorkflow

export interface CreateWorkflowInput {
  [key: string]: unknown
  id?: string
  tenantId?: string | null
  name: string
  description?: string | null
  nodes: string
  edges: string
  enabled: boolean
  version?: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
}

export interface UpdateWorkflowInput {
  [key: string]: unknown
  tenantId?: string | null
  name?: string
  description?: string | null
  nodes?: string
  edges?: string
  enabled?: boolean
  version?: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
}
