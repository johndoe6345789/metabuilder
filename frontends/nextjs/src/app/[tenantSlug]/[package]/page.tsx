/**
 * /{tenantSlug}/{package} -- what the founder published there, or the
 * built-in package of that name.
 *
 * The founder's own page is tried first. It used to be the other way
 * round, and `packages/` ships directories called `admin`, `dashboard`,
 * `global`, `examples` and two dozen more -- which are *available*
 * packages, not ones this tenant installed. So every community had those
 * paths quietly reserved: publish a page at /dashboard and the built-in
 * package's home component rendered instead, with nothing in the builder
 * saying why. This is the founder's site; what they published wins.
 */

import { notFound } from 'next/navigation'
import { join } from 'path'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import { getPackagesDir } from '@/lib/packages/unified/get-packages-dir'
import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import { mayViewPage } from '@/lib/tenant/page-access'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import type { JSONComponent } from '@/lib/packages/json/types'

interface PackagePageProps {
  params: Promise<{ tenantSlug: string; package: string }>
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { tenantSlug, package: pkg } = await params

  const published = await publishedPage(tenantSlug, pkg)
  if (published !== null) return published

  const builtIn = await builtInPackagePage(tenantSlug, pkg)
  if (builtIn !== null) return builtIn

  // Outside the try below: notFound() signals by throwing, and it used to
  // sit inside one whose catch swallowed it into the fallback.
  notFound()
}

/** The tree this tenant published at that path, if they may see it. */
async function publishedPage(tenant: string, pkg: string) {
  const page = await fetchTenantPage(tenant, `/${pkg}`)
  if (
    page == null ||
    !page.isActive ||
    page.componentTree === null ||
    page.componentTree === undefined
  ) {
    return null
  }
  // The row says who may see this; without asking, a page the founder
  // marked "Admin only" was served in full to whoever had the URL.
  if (!(await mayViewPage(page))) return null
  return (
    <UIPageRenderer
      layout={page.componentTree as JSONComponent}
      actions={{}}
    />
  )
}

/** The home component of the built-in package of that name, if any. */
async function builtInPackagePage(tenant: string, pkg: string) {
  try {
    const data = await loadJSONPackage(join(getPackagesDir(), pkg))
    // Prefer home_page, then HomePage, then Home, then the first.
    const home =
      data.components?.find(
        c => c.id === 'home_page' || c.name === 'HomePage' || c.name === 'Home'
      ) ?? data.components?.[0]
    if (home == null) return null
    return renderJSONComponent(home, { tenant, package: pkg }, {})
  } catch {
    return null
  }
}

export { generateMetadata } from './metadata'
