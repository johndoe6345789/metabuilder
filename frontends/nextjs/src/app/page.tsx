import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import type { JSONComponent } from '@/lib/packages/json/types'

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
    filter: {
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
    const route = godPanelRoutes.data[0] as typeof godPanelRoutes.data[number]  // Safe: length check ensures element exists

    // TODO: Implement proper session/user context for permission checks
    // For now, we'll allow access to public routes and skip auth checks
    // Full implementation requires:
    // 1. Session middleware to get current user from cookies
    // 2. User permission level check: user.level >= route.level
    // 3. Auth requirement: if (route.requiresAuth && !user) redirect('/login')
    
    // Permission level check (when user context is available)
    // const user = await getCurrentUser() // TODO: Implement getCurrentUser
    // if (user && user.level < route.level) {
    //   return <div>Access Denied: Insufficient permissions</div>
    // }
    
    // Auth requirement check
    // if (route.requiresAuth && !user) {
    //   redirect('/login')
    // }

    // If route has full component tree, render it directly
    if (route.componentTree !== null && route.componentTree !== undefined && route.componentTree.length > 0) {
      const componentDef = JSON.parse(route.componentTree) as unknown as JSONComponent
      return renderJSONComponent(componentDef, {}, {})
    }

    // Otherwise use the package + component reference
    if (route.packageId !== undefined && route.packageId !== null && route.component !== undefined && route.component !== null) {
      const pkg = await loadJSONPackage(`/home/rewrich/Documents/GitHub/metabuilder/packages/${route.packageId}`)
      const component = pkg?.components?.find(c => c.id === route.component || c.name === route.component)

      if (component !== null && component !== undefined) {
        return renderJSONComponent(component, {}, {})
      }
    }
  }

  // PRIORITY 2: Check package default routes (InstalledPackage.config.defaultRoute)
  const installedPackages = await adapter.list('InstalledPackage', {
    filter: {
      enabled: true,
    },
  }) as { data: Array<{ packageId: string; config: string }> }

  const homePackageRecord = installedPackages.data.find((pkg) => {
    try {
      const config = JSON.parse(pkg.config ?? '{}') as { defaultRoute?: string }
      return config.defaultRoute === '/'
    } catch {
      return false
    }
  })

  if (homePackageRecord !== null && homePackageRecord !== undefined) {
    const packageId = homePackageRecord.packageId
    const pkg = await loadJSONPackage(`/home/rewrich/Documents/GitHub/metabuilder/packages/${packageId}`)

    if ((pkg?.components !== null && pkg?.components !== undefined) && pkg.components.length > 0) {
      const pageComponent = pkg.components.find(c =>
        c.id === 'home_page' ||
        c.name === 'HomePage' ||
        c.name === 'Home'
      ) ?? pkg.components[0]

      if (pageComponent !== null && pageComponent !== undefined) {
        return renderJSONComponent(pageComponent, {}, {})
      }
    }
  }

  // No route found
  notFound()
}

export const metadata: Metadata = {
  title: 'MetaBuilder - Home',
  description: 'Data-driven application platform',
}
