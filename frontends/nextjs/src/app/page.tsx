import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'

/**
 * Root page handler with routing priority:
 * 1. God panel routes (PageConfig table) - user-configurable, highest priority
 * 2. Package default routes (InstalledPackage.config.defaultRoute) - package-defined fallback
 *
 * This allows god/supergod users to override any route through the admin panel,
 * while still having sensible defaults from packages.
 */
export default async function RootPage() {
  const adapter = getAdapter()

  // PRIORITY 1: Check god panel routes (PageConfig)
  const godPanelRoutes = await adapter.list('PageConfig', {
    filters: {
      path: '/',
      isPublished: true,
    },
  }) as { data: Array<{
    packageId: string
    component: string
    componentTree: string
    level: number
    requiresAuth: boolean
  }> }

  if (godPanelRoutes.data.length > 0) {
    const route = godPanelRoutes.data[0]

    // TODO: Check user permission level >= route.level
    // TODO: Check auth if route.requiresAuth

    // If route has full component tree, render it directly
    if (route.componentTree) {
      const componentDef = JSON.parse(route.componentTree)
      return renderJSONComponent(componentDef, {}, {})
    }

    // Otherwise use the package + component reference
    if (route.packageId && route.component) {
      const pkg = await loadJSONPackage(`/home/rewrich/Documents/GitHub/metabuilder/packages/${route.packageId}`)
      const component = pkg?.components.find(c => c.id === route.component || c.name === route.component)

      if (component) {
        return renderJSONComponent(component, {}, {})
      }
    }
  }

  // PRIORITY 2: Check package default routes (InstalledPackage.config.defaultRoute)
  const installedPackages = await adapter.list('InstalledPackage', {
    filters: {
      enabled: true,
    },
  }) as { data: Array<{ packageId: string; config: string }> }

  const homePackageRecord = installedPackages.data.find((pkg) => {
    try {
      const config = JSON.parse(pkg.config || '{}')
      return config.defaultRoute === '/'
    } catch {
      return false
    }
  })

  if (homePackageRecord) {
    const packageId = homePackageRecord.packageId
    const pkg = await loadJSONPackage(`/home/rewrich/Documents/GitHub/metabuilder/packages/${packageId}`)

    if (pkg?.components && pkg.components.length > 0) {
      const pageComponent = pkg.components.find(c =>
        c.id === 'home_page' ||
        c.name === 'HomePage' ||
        c.name === 'Home'
      ) || pkg.components[0]

      return renderJSONComponent(pageComponent, {}, {})
    }
  }

  // No route found
  notFound()
}

export const metadata: Metadata = {
  title: 'MetaBuilder - Home',
  description: 'Data-driven application platform',
}
