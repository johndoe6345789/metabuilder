/**
 * Type definitions for core database entities
 * These types match the DBAL schema models
 */

export type UserRole = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'

export interface User {
  id?: string
  username?: string
  email?: string
  role?: string
  profilePicture?: string | null
  bio?: string | null
  createdAt: number | bigint
  tenantId?: string | null
  isInstanceOwner?: boolean
  passwordChangeTimestamp?: number | bigint | null
  firstLogin?: boolean
}

export interface Tenant {
  id: string
  name: string
  slug: string
  ownerId: string
  createdAt: number | bigint
  homepageConfig?: string | null
  settings?: string | null
}

export interface PageConfig {
  id: string
  tenantId?: string | null
  packageId?: string | null
  path: string
  title: string
  description?: string | null
  icon?: string | null
  component?: string | null
  componentTree?: unknown // JSON: full component tree
  level?: number
  requiresAuth?: boolean
  requiredRole?: string | null
  accessLevel?: number | null
  createdAt?: number | bigint
  updatedAt?: number | bigint
}

export interface Comment {
  id: string
  userId: string
  entityType: string | null
  entityId: string | null
  content: string
  createdAt: number | bigint
  updatedAt?: number | bigint | null
  parentId?: string | null
}

export interface Workflow {
  id: string
  tenantId?: string | null
  name: string
  description?: string | null
  nodes?: unknown // JSON: WorkflowNode[]
  edges?: unknown // JSON: WorkflowEdge[]
  enabled?: boolean
  version?: number
  createdAt?: number | bigint
  updatedAt?: number | bigint | null
  createdBy?: string | null
}

export interface AppConfiguration {
  id: string
  name: string
  schemas: unknown // JSON
  workflows: unknown // JSON
  pages: unknown // JSON
  theme: unknown // JSON
}

export interface DropdownConfig {
  id: string
  name: string
  label: string
  options: string // JSON: Array<{value, label}>
}

export interface PowerTransferRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: string // pending, accepted, rejected
  createdAt: number | bigint
  expiresAt: number | bigint
}
