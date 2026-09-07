/**
 * What a published package page calls itself.
 *
 * Split from page.tsx only to keep that file inside the 80-line rule; the
 * sibling [...slug] route splits its metadata the same way.
 */

import { join } from 'path'

import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { getPackagesDir } from '@/lib/packages/unified/get-packages-dir'
import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import { mayViewPage } from '@/lib/tenant/page-access'

interface MetadataProps {
  params: Promise<{ tenantSlug: string; package: string }>
}

export async function generateMetadata({ params }: MetadataProps) {
  const { tenantSlug, package: pkg } = await params

  // Try to load package metadata
  try {
    const packageData = await loadJSONPackage(join(getPackagesDir(), pkg))
    return {
      title: `${packageData.metadata.name} - ${tenantSlug} | MetaBuilder`,
      description:
        packageData.metadata.description.length > 0
          ? packageData.metadata.description
          : `${packageData.metadata.name} package for tenant ${tenantSlug}`,
    }
  } catch {
    // Fallback if package can't be loaded
    const page = await fetchTenantPage(tenantSlug, `/${pkg}`)
    // A title and description are content too: "Board minutes -- Internal"
    // in a tab, a search result or a link preview gives the page away.
    if (
      page !== null &&
      page.isActive &&
      page.title.length > 0 &&
      (await mayViewPage(page))
    ) {
      return {
        title: `${page.title} | ${tenantSlug} | MetaBuilder`,
        description:
          page.description !== null &&
          page.description !== undefined &&
          page.description.length > 0
            ? page.description
            : `${page.title} for tenant ${tenantSlug}`,
      }
    }

    return {
      title: `${pkg} - ${tenantSlug} | MetaBuilder`,
      description: `${pkg} package for tenant ${tenantSlug}`,
    }
  }
}
