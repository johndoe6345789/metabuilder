/**
 * Type definitions for core database entities
 * These types match the Prisma schema models
 */

export type UserRole = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'

export interface User {
  id: string
  username: string
  email: string
  role: string
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
  luaScript?: string | null
  accessLevel?: number | null
  createdAt?: number | bigint
  updatedAt?: number | bigint
}

export interface Comment {
  id: string
  userId: string
  entityType: string
  entityId: string
  content: string
  createdAt: number | bigint
  updatedAt?: number | bigint | null
  parentId?: string | null
}

export interface Workflow {
  id: string
  name: string
  tenantId?: string | null
  definition: string
  status: string
  createdAt: number | bigint
  updatedAt?: number | bigint | null
}

export interface AppConfiguration {
  id: string
  key: string
  value: string
  description?: string | null
  createdAt?: number | bigint
  updatedAt?: number | bigint | null
}
