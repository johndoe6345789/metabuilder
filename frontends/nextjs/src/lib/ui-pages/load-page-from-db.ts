/**
 * Load UI page from database
 */

import type { PageConfig } from '../types/level-types'
import { prisma } from '@/lib/config/prisma'

export async function loadPageFromDb(path: string, tenantId?: string): Promise<PageConfig | null> {
  // Prisma client typing is generated; suppress lint in environments without generated types.
   
  const page = await prisma.pageConfig.findFirst({
    where: {
      path,
      tenantId: tenantId ?? null,
      isPublished: true,
    },
  }) as PageConfig | null

  if (page === null) {
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
    createdAt: page.createdAt !== undefined ? Number(page.createdAt) : undefined,
    updatedAt: page.updatedAt !== undefined ? Number(page.updatedAt) : undefined,
  }
}
