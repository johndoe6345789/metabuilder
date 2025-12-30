export interface Workflow {
  id: string
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
  name: string
  description?: string
  trigger: Workflow['trigger']
  triggerConfig: Record<string, unknown>
  steps: Record<string, unknown>
  isActive?: boolean
  createdBy: string
}

export interface UpdateWorkflowInput {
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
  name: string
  description?: string
  code: string
  isSandboxed?: boolean
  allowedGlobals: string[]
  timeoutMs?: number
  createdBy: string
}

export interface UpdateLuaScriptInput {
  name?: string
  description?: string
  code?: string
  isSandboxed?: boolean
  allowedGlobals?: string[]
  timeoutMs?: number
  createdBy?: string
}
