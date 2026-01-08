import type { PageConfig as GeneratedPageConfig, ComponentNode as GeneratedComponentNode } from '../types.generated'

export type PageConfig = GeneratedPageConfig

export interface CreatePageInput {
  id?: string
  tenantId?: string | null
  packageId?: string | null
  path: string
  title: string
  description?: string | null
  icon?: string | null
  component?: string | null
  componentTree: string
  level: number
  requiresAuth: boolean
  requiredRole?: string | null
  parentPath?: string | null
  sortOrder?: number
  isPublished?: boolean
  params?: string | null
  meta?: string | null
  createdAt?: bigint | null
  updatedAt?: bigint | null
}

export interface UpdatePageInput {
  [key: string]: unknown
  tenantId?: string | null
  packageId?: string | null
  path?: string
  title?: string
  description?: string | null
  icon?: string | null
  component?: string | null
  componentTree?: string
  level?: number
  requiresAuth?: boolean
  requiredRole?: string | null
  parentPath?: string | null
  sortOrder?: number
  isPublished?: boolean
  params?: string | null
  meta?: string | null
  createdAt?: bigint | null
  updatedAt?: bigint | null
}

export type ComponentNode = GeneratedComponentNode

export interface CreateComponentNodeInput {
  id?: string
  type: string
  parentId?: string | null
  childIds: string
  order: number
  pageId: string
}

export interface UpdateComponentNodeInput {
  [key: string]: unknown
  type?: string
  parentId?: string | null
  childIds?: string
  order?: number
  pageId?: string
}

export interface ComponentConfig {
  id: string
  componentId: string
  props: string
  styles: string
  events: string
  conditionalRendering?: string | null
}

export interface CreateComponentConfigInput {
  id?: string
  componentId: string
  props: string
  styles: string
  events: string
  conditionalRendering?: string | null
}

export interface UpdateComponentConfigInput {
  componentId?: string
  props?: string
  styles?: string
  events?: string
  conditionalRendering?: string | null
}
