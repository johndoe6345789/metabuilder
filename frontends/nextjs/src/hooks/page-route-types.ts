/** The shape of a PageConfig row as the routes UI uses it. */

export interface PageRoute {
  id: string
  path: string
  title: string
  description?: string | null
  level: number
  requiresAuth: boolean
  requiredRole?: string | null
  /** The PageTree this route renders, if any. */
  pageTreeId: string | null
  // Matches PageConfig's actual field name (DBAL schema) -- this was
  // "isActive" before, which isn't a real field, so every create/update
  // 422'd on "isPublished: Field is required".
  isPublished: boolean
  sortOrder: number
  tenantId?: string | null
  packageId?: string | null
}

export type PageRouteInput = Omit<PageRoute, 'id'>
