export interface PageConfig {
  id: string
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
  sortOrder: number
  isPublished: boolean
  params?: string | null
  meta?: string | null
  createdAt?: bigint | null
  updatedAt?: bigint | null
}

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

export interface ComponentNode {
  id: string
  type: string
  parentId?: string | null
  childIds: string
  order: number
  pageId: string
}

export interface CreateComponentNodeInput {
  id?: string
  type: string
  parentId?: string | null
  childIds: string
  order: number
  pageId: string
}

export interface UpdateComponentNodeInput {
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
