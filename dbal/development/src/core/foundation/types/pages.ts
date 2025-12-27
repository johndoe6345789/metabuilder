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
