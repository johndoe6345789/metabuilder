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
