export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'god' | 'supergod'
  createdAt: Date
  updatedAt: Date
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
