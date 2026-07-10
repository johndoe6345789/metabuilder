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

    // Find home component: prioritize 'home_page', then 'HomePage', then 'Home', then first component
    const homeComponent =
      packageData.components?.find(
        c => c.id === 'home_page' || c.name === 'HomePage' || c.name === 'Home'
      ) ?? packageData.components?.[0]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (homeComponent === null || homeComponent === undefined) {
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
    if (
      page !== null &&
      page.isActive &&
      page.componentTree !== null &&
      page.componentTree !== undefined
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

export async function generateMetadata({ params }: PackagePageProps) {
  const { tenantSlug, package: pkg } = await params

  // Try to load package metadata
  try {
    const packageData = await loadJSONPackage(join(getPackagesDir(), pkg))
    return {
      title: `${packageData.metadata.name} - ${tenantSlug} | MetaBuilder`,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      description:
        packageData.metadata.description !== null &&
        packageData.metadata.description !== undefined &&
        packageData.metadata.description.length > 0
          ? packageData.metadata.description
          : `${packageData.metadata.name} package for tenant ${tenantSlug}`,
    }
  } catch {
    // Fallback if package can't be loaded
    return {
      title: `${pkg} - ${tenantSlug} | MetaBuilder`,
      description: `${pkg} package for tenant ${tenantSlug}`,
    }
  }
}
