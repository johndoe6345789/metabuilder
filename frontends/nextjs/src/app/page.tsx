import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { join } from 'path'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import { getPackagesDir } from '@/lib/packages/unified/get-packages-dir'
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
    packageId?: string | null
    component?: string | null
    componentTree?: string | null
    level: number
    requiresAuth: boolean
  }> }

  if (godPanelRoutes.data.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const route = godPanelRoutes.data[0]!  // Safe: length check ensures element exists

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
      try {
        const parsed = JSON.parse(route.componentTree) as Record<string, unknown>
        // Validate required fields for JSONComponent
        if (typeof parsed.id === 'string' && typeof parsed.name === 'string') {
          const componentDef: JSONComponent = {
            id: parsed.id,
            name: parsed.name,
            description: typeof parsed.description === 'string' ? parsed.description : undefined,
            props: Array.isArray(parsed.props) ? parsed.props as JSONComponent['props'] : undefined,
            render: typeof parsed.render === 'object' && parsed.render !== null 
              ? parsed.render as JSONComponent['render'] 
              : undefined,
          }
          return renderJSONComponent(componentDef, {}, {})
        }
      } catch {
        // Invalid JSON in componentTree, fall through to package reference
      }
    }

    // Otherwise use the package + component reference
    if (route.packageId !== null && route.packageId !== undefined &&
        route.component !== null && route.component !== undefined) {
      try {
        const pkg = await loadJSONPackage(join(getPackagesDir(), route.packageId))
        const component = pkg.components?.find(c => c.id === route.component || c.name === route.component)

        if (component !== undefined) {
          return renderJSONComponent(component, {}, {})
        }
      } catch {
        // Package doesn't exist or can't be loaded, fall through
      }
    }
  }

  // PRIORITY 2: Check package default routes (InstalledPackage.config.defaultRoute)
  const installedPackages = await adapter.list('InstalledPackage', {
    filter: {
      enabled: true,
    },
  }) as { data: Array<{ packageId: string; config?: string | null }> }

  const homePackageRecord = installedPackages.data.find((pkg) => {
    try {
      const config = JSON.parse(pkg.config ?? '{}') as { defaultRoute?: string }
      return config.defaultRoute === '/'
    } catch {
      return false
    }
  })

  if (homePackageRecord !== undefined) {
    const packageId = homePackageRecord.packageId
    try {
      const pkg = await loadJSONPackage(join(getPackagesDir(), packageId))

      if (pkg.components !== undefined && pkg.components.length > 0) {
        const pageComponent = pkg.components.find(c =>
          c.id === 'home_page' ||
          c.name === 'HomePage' ||
          c.name === 'Home'
        ) ?? pkg.components[0]

        if (pageComponent !== undefined) {
          return renderJSONComponent(pageComponent, {}, {})
        }
      }
    } catch {
      // Package doesn't exist or can't be loaded
    }
  }

  // No route found
  notFound()
}

export const metadata: Metadata = {
  title: 'MetaBuilder - Home',
  description: 'Data-driven application platform',
}
