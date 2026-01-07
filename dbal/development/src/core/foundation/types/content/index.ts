export interface PageView {
  id: string
  tenantId: string
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
  tenantId?: string
  slug: string
  title: string
  description?: string
  level: number
  layout: Record<string, unknown>
  isActive?: boolean
}

export interface UpdatePageInput {
  tenantId?: string
  slug?: string
  title?: string
  description?: string
  level?: number
  layout?: Record<string, unknown>
  isActive?: boolean
}

export interface ComponentHierarchy {
  id: string
  tenantId: string
  pageId: string
  parentId?: string
  componentType: string
  order: number
  props: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
