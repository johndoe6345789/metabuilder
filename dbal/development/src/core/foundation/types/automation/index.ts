export interface Workflow {
  id: string
  tenantId: string
  name: string
  description?: string
  trigger: 'manual' | 'schedule' | 'event' | 'webhook'
  triggerConfig: Record<string, unknown>
  steps: Record<string, unknown>
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkflowInput {
  tenantId?: string
  name: string
  description?: string
  trigger: Workflow['trigger']
  triggerConfig: Record<string, unknown>
  steps: Record<string, unknown>
  isActive?: boolean
  createdBy: string
}

export interface UpdateWorkflowInput {
  tenantId?: string
  name?: string
  description?: string
  trigger?: Workflow['trigger']
  triggerConfig?: Record<string, unknown>
  steps?: Record<string, unknown>
  isActive?: boolean
  createdBy?: string
}

export interface LuaScript {
  id: string
  tenantId: string
  name: string
  description?: string
  code: string
  isSandboxed: boolean
  allowedGlobals: string[]
  timeoutMs: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateLuaScriptInput {
  tenantId?: string
  name: string
  description?: string
  code: string
  isSandboxed?: boolean
  allowedGlobals: string[]
  timeoutMs?: number
  createdBy: string
}

export interface UpdateLuaScriptInput {
  tenantId?: string
  name?: string
  description?: string
  code?: string
  isSandboxed?: boolean
  allowedGlobals?: string[]
  timeoutMs?: number
  createdBy?: string
}
