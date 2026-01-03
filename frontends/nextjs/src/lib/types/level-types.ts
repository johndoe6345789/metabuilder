/**
 * Core type definitions for MetaBuilder
 * These types correspond to Prisma models and are used throughout the application
 */

// User role/level types
export type UserRole = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  profilePicture?: string
  bio?: string
  createdAt: number
  tenantId?: string
  isInstanceOwner: boolean
}

export interface Tenant {
  id: string
  name: string
  slug: string
  ownerId: string
  createdAt: number
  homepageConfig?: string
  settings?: string
}

export interface Comment {
  id: string
  tenantId?: string
  userId: string
  content: string
  createdAt: number
  updatedAt?: number
  parentId?: string
  entityType?: string
  entityId?: string
}

export interface PageConfig {
  id: string
  tenantId?: string
  packageId?: string
  path: string
  title: string
  description?: string
  icon?: string
  component?: string
  componentTree: string | any[] // Can be JSON string or parsed array
  level: number
  requiresAuth: boolean
  requiredRole?: string
  parentPath?: string
  sortOrder: number
  isPublished: boolean
}

export interface Workflow {
  id: string
  tenantId?: string
  name: string
  description?: string
  trigger: string
  actions: string
  isActive: boolean
  createdAt: number
  updatedAt?: number
  nodes?: any // Additional field used in some places
  edges?: any // Additional field used in some places
  enabled?: boolean // Alternative to isActive in some places
}

export interface LuaScript {
  id: string
  tenantId?: string
  name: string
  description?: string
  script: string
  isActive: boolean
  createdAt: number
  updatedAt?: number
}

export interface AppConfiguration {
  id: string
  name: string
  schemas: string | unknown[] // JSON string or parsed array
  workflows: string | unknown[] // JSON string or parsed array
  luaScripts: string | unknown[] // JSON string or parsed array
  pages: string | unknown[] // JSON string or parsed array
  theme: string | unknown // JSON string or parsed object
}

export interface PowerTransferRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: string
  requestedAt: number
  resolvedAt?: number
  expiresAt?: number
}

export interface SMTPConfig {
  id: string
  tenantId?: string
  host: string
  port: number
  username: string
  password: string
  fromEmail: string
  fromName?: string
  secure: boolean
  createdAt: number
  updatedAt?: number
}
