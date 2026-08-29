/**
 * A nested path may be a database-driven page rather than an entity view.
 *
 * /{tenant}/{page} already falls back this way in ../page.tsx; without the
 * same fallback here, /{tenant}/tree-demo/primitives reached the entity
 * browser and reported "Invalid package ID" instead of rendering the page.
 */

import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import type { JSONComponent } from '@/lib/packages/json/types'
import type { ReactElement } from 'react'

export async function tenantPageFallback(
  tenantSlug: string,
  pkg: string,
  slug: string[]
): Promise<ReactElement | null> {
  const page = await fetchTenantPage(tenantSlug, `/${pkg}/${slug.join('/')}`)
  if (
    page === null ||
    !page.isActive ||
    page.componentTree === null ||
    page.componentTree === undefined
  ) {
    return null
  }

  return (
    <UIPageRenderer
      layout={page.componentTree as JSONComponent}
      actions={{}}
    />
  )
}
