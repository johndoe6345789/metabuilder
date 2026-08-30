/** Provisioning the pages a freshly installed package ships with. */

import { saveTree, type TreeNodeShape } from '@/lib/tenant/page-tree'
import {
  defaultComponentTree,
  type PRODUCT_PACKAGES,
} from '@/lib/packages/product-packages'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
export const SYSTEM_TENANT = 'system'

export type ProductPackage = (typeof PRODUCT_PACKAGES)[number]

/** A blank or whitespace-only tenant name falls back to system. */
export function normalizeTenant(input: string): string {
  const trimmed = input.trim()
  return trimmed.length > 0 ? trimmed : SYSTEM_TENANT
}

/** A tree id unique to this package and route, safe as a DBAL id. */
export function treeIdFor(pkg: Pick<ProductPackage, 'id'>, path: string): string {
  return `tree_${pkg.id}_${path.replace(/[^a-z0-9]+/gi, '_')}`
}

/**
 * Publishes one of a package's default routes.
 *
 * level: 0 (public, per ROLE_LEVELS) -- a package's own starter pages are
 * meant to be visible the moment it's installed, with no auth wall the
 * tenant didn't ask for.
 */
async function createDefaultPage(
  tenant: string,
  pkg: ProductPackage,
  route: { path: string; title: string }
): Promise<Response> {
  const treeId = treeIdFor(pkg, route.path)
  const wrote = await saveTree(
    DBAL,
    tenant,
    treeId,
    route.title,
    defaultComponentTree(route.title) as unknown as TreeNodeShape,
    `Starter layout for ${pkg.id}`
  )
  return fetch(`${DBAL}/${tenant}/core/PageConfig`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: route.path,
      title: route.title,
      isPublished: true,
      level: 0,
      requiresAuth: false,
      sortOrder: 0,
      packageId: pkg.id,
      tenantId: tenant,
      pageTreeId: wrote ? treeId : null,
    }),
  })
}

/** Every one of a package's default routes, published in parallel. */
export async function createDefaultPages(
  tenant: string,
  pkg: ProductPackage
): Promise<void> {
  await Promise.all(
    pkg.defaultRoutes.map(route => createDefaultPage(tenant, pkg, route))
  )
}
