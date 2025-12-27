export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'god' | 'supergod'
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  username: string
  email: string
  role?: User['role']
}

export interface UpdateUserInput {
  username?: string
  email?: string
  role?: User['role']
}

export interface Credential {
  id: string
  username: string
  passwordHash: string
  firstLogin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastActivity: Date
}

export interface CreateSessionInput {
  userId: string
  token: string
  expiresAt: Date
}

export interface UpdateSessionInput {
  userId?: string
  token?: string
  expiresAt?: Date
  lastActivity?: Date
}

export interface PageView {
  id: string
  slug: string
  title: string
  description?: string
  level: number
  layout: Record<string, unknown>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreatePageInput {
  slug: string
  title: string
  description?: string
  level: number
  layout: Record<string, unknown>
  isActive?: boolean
}

export interface UpdatePageInput {
  slug?: string
  title?: string
  description?: string
  level?: number
  layout?: Record<string, unknown>
  isActive?: boolean
}

export interface ComponentHierarchy {
  id: string
  pageId: string
  parentId?: string
  componentType: string
  order: number
  props: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

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

export interface Package {
  id: string
  name: string
  version: string
  description?: string
  author: string
  manifest: Record<string, unknown>
  isInstalled: boolean
  installedAt?: Date
  installedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePackageInput {
  name: string
  version: string
  description?: string
  author: string
  manifest: Record<string, unknown>
  isInstalled?: boolean
  installedAt?: Date
  installedBy?: string
}

export interface UpdatePackageInput {
  name?: string
  version?: string
  description?: string
  author?: string
  manifest?: Record<string, unknown>
  isInstalled?: boolean
  installedAt?: Date
  installedBy?: string
}

export interface ListOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, 'asc' | 'desc'>
  page?: number
  limit?: number
}

export interface ListResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ResultError {
  code: string
  message: string
}

export type Result<T> = { success: true; data: T } | { success: false; error: ResultError }
