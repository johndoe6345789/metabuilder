import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { join } from 'path'
import { getDBALClient } from '@/dbal'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { getPackagesDir } from '@/lib/packages/unified/get-packages-dir'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { AccessDenied } from '@/components/AccessDenied'
import { JSONComponentRenderer } from '@/components/JSONComponentRenderer'

/**
 * Root page handler with routing priority:
 * 1. God panel routes (PageConfig table) - user-configurable, highest priority
 * 2. Package default routes (InstalledPackage.config.defaultRoute) - package-defined fallback
 *
 * This allows god/supergod users to override any route through the admin panel,
 * while still having sensible defaults from packages.
 */

// Disable static generation - this page requires dynamic database access
export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const client = getDBALClient()

  // PRIORITY 1: Check god panel routes (PageConfig)
  const godPanelRoutes = await client.pageConfigs.list({
    filter: {
      path: '/',
      isPublished: true,
    },
  })

  if (godPanelRoutes.data.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const route = godPanelRoutes.data[0]!  // Safe: length check ensures element exists

    // Get current user for permission checks
    const user = await getCurrentUser()
    
    // Auth requirement check - redirect to login if required
    if (route.requiresAuth && user === null) {
      redirect('/ui/login')
    }
    
    // Permission level check - show access denied if insufficient
    if (user !== null && user.level < route.level) {
      return <AccessDenied requiredLevel={route.level} userLevel={user.level} />
    }

    // If route has full component tree, render it directly
    if (route.componentTree !== null && route.componentTree !== undefined && route.componentTree.length > 0) {
      try {
        const parsed = JSON.parse(route.componentTree) as Record<string, unknown>
        // Validate required fields for JSONComponent
        if (typeof parsed.id === 'string' && typeof parsed.name === 'string') {
          const componentDef = {
            id: parsed.id,
            name: parsed.name,
            description: typeof parsed.description === 'string' ? parsed.description : undefined,
            props: Array.isArray(parsed.props) ? parsed.props : undefined,
            render: typeof parsed.render === 'object' && parsed.render !== null 
              ? parsed.render 
              : undefined,
          }
          return <JSONComponentRenderer component={componentDef} />
        }
      } catch {
        // Invalid JSON in componentTree, fall through to package reference
      }
    }

    // Otherwise use the package + component reference
    if (route.packageId !== null && route.packageId !== undefined &&
        route.component !== null && route.component !== undefined) {
      try {
        console.log('[RootPage] Loading package:', route.packageId, 'component:', route.component)
        const pkg = await loadJSONPackage(join(getPackagesDir(), route.packageId))
        console.log('[RootPage] Package loaded, has', pkg.components?.length, 'components')
        const component = pkg.components?.find(c => c.id === route.component || c.name === route.component)
        console.log('[RootPage] Component found:', !!component)

        if (component !== undefined) {
          console.log('[RootPage] Rendering component:', component.name)
          return <JSONComponentRenderer component={component} allComponents={pkg.components} />
        } else {
          console.error('[RootPage] Component not found in package. Available:', pkg.components?.map(c => c.id).join(', '))
        }
      } catch (error) {
        console.error('[RootPage] Error loading package:', error)
        // Package doesn't exist or can't be loaded, fall through
      }
    }
  }

  // PRIORITY 2: Check package default routes (InstalledPackage.config.defaultRoute)
  const installedPackages = await client.installedPackages.list({
    filter: {
      enabled: true,
    },
  })

  const homePackageRecord = installedPackages.data.find((pkg) => {
    try {
      const config = JSON.parse(pkg.config ?? '{}') as { defaultRoute?: string }
      return config.defaultRoute === '/'
    } catch {
      return false
    }
  })

  if (homePackageRecord !== undefined && homePackageRecord.packageId !== undefined && homePackageRecord.packageId !== null) {
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
          return <JSONComponentRenderer component={pageComponent} allComponents={pkg.components} />
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
