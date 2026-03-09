/**
 * Load UI page from database
 */

import type { PageConfig } from '../types/level-types'
import { db } from '@/lib/db-client'

export async function loadPageFromDb(path: string, tenantId?: string): Promise<PageConfig | null> {
  const filter: Record<string, unknown> = { path, isPublished: true }
  if (tenantId !== undefined) {
    filter.tenantId = tenantId
  }

  const result = await db.pageConfigs.list({ filter })
  const page = result.data[0] ?? null

  if (page === null) {
    return null
  }

  return {
    id: page.id as string,
    tenantId: page.tenantId as string,
    packageId: page.packageId as string,
    path: page.path as string,
    title: page.title as string,
    description: page.description as string | undefined,
    icon: page.icon as string | undefined,
    component: page.component as string,
    componentTree: JSON.parse((page.componentTree as string | null) ?? '{}'),
    level: page.level as number,
    requiresAuth: page.requiresAuth as boolean,
    requiredRole: page.requiredRole as string | undefined,
    accessLevel: page.level as number,
    createdAt: page.createdAt !== undefined ? Number(page.createdAt) : undefined,
    updatedAt: page.updatedAt !== undefined ? Number(page.updatedAt) : undefined,
  }
}
