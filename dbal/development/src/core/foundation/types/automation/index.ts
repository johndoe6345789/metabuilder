export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: string
  edges: string
  enabled: boolean
  version: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
  tenantId?: string | null
}

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

export interface LuaScript {
  id: string
  name: string
  description?: string
  code: string
  parameters: string
  returnType?: string | null
  isSandboxed: boolean
  allowedGlobals: string
  timeoutMs: number
  version: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
  tenantId?: string | null
}

export interface CreateLuaScriptInput {
  id?: string
  name: string
  description?: string
  code: string
  parameters: string
  returnType?: string | null
  isSandboxed?: boolean
  allowedGlobals: string
  timeoutMs?: number
  version?: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
  tenantId?: string | null
}

export interface UpdateLuaScriptInput {
  name?: string
  description?: string
  code?: string
  parameters?: string
  returnType?: string | null
  isSandboxed?: boolean
  allowedGlobals?: string
  timeoutMs?: number
  version?: number
  createdAt?: bigint | null
  updatedAt?: bigint | null
  createdBy?: string | null
  tenantId?: string | null
}
