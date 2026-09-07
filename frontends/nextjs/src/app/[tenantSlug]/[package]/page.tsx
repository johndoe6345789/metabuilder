/**
 * Package Home Page
 *
 * Default page for /{tenantSlug}/{package}
 * Shows the package dashboard/home component.
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
  params: Promise<{
    tenantSlug: string
    package: string
  }>
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { tenantSlug, package: pkg } = await params

  // Load package from filesystem
  try {
    const packageData = await loadJSONPackage(join(getPackagesDir(), pkg))

    // Prefer home_page, then HomePage, then Home, then the first component.
    const homeComponent =
      packageData.components?.find(
        c => c.id === 'home_page' || c.name === 'HomePage' || c.name === 'Home'
      ) ?? packageData.components?.[0]

    if (homeComponent == null) {
      // Package exists but has no components
      notFound()
    }

    // Render the home component with tenant and package context
    return renderJSONComponent(
      homeComponent,
      { tenant: tenantSlug, package: pkg },
      {}
    )
  } catch {
    // Not a filesystem package — check if it's a DBAL tenant page
    const page = await fetchTenantPage(tenantSlug, `/${pkg}`)
    // The row says who may see this; without asking, a page the founder
    // marked "Admin only" was served in full to whoever had the URL.
    if (
      page !== null &&
      page.isActive &&
      page.componentTree !== null &&
      page.componentTree !== undefined &&
      (await mayViewPage(page))
    ) {
      return (
        <UIPageRenderer
          layout={page.componentTree as JSONComponent}
          actions={{}}
        />
      )
    }
    notFound()
  }
}

export { generateMetadata } from './metadata'
