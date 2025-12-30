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
