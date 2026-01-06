/**
 * Load UI page from database
 */

import type { PageConfig } from '../types/level-types'
import { prisma } from '@/lib/config/prisma'

export type LuaActionHandler = (action: string, data: Record<string, unknown>) => void | Promise<void>

export interface UIPageData {
  layout: unknown
  actions?: Record<string, LuaActionHandler>
}

export async function loadPageFromDb(path: string, tenantId?: string): Promise<PageConfig | null> {
  const page = await prisma.pageConfig.findFirst({
    where: {
      path,
      tenantId: tenantId || null,
      isPublished: true,
    },
  })

  if (!page) {
    return null
  }

  return {
    id: page.id,
    tenantId: page.tenantId,
    packageId: page.packageId,
    path: page.path,
    title: page.title,
    description: page.description,
    icon: page.icon,
    component: page.component,
    componentTree: JSON.parse(page.componentTree),
    level: page.level,
    requiresAuth: page.requiresAuth,
    requiredRole: page.requiredRole,
    accessLevel: page.level,
    createdAt: page.createdAt ? Number(page.createdAt) : undefined,
    updatedAt: page.updatedAt ? Number(page.updatedAt) : undefined,
  }
}
