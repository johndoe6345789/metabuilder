/**
 * Example: How to integrate permissions into the package renderer
 * This shows how to check permissions before rendering packages and components
 */

import type { User } from '@/lib/types/level-types'

import { checkComponentPermissions, checkPackagePermissions, type PermissionContext } from './check-package-permissions'
import { permissionManager } from './permission-manager'

/**
 * Example: Check package permissions before loading
 */
export async function loadPackageWithPermissions(
  packageId: string,
  packageMetadata: any,
  user: User | null
): Promise<{ allowed: boolean; reason?: string }> {
  // Build permission context from user
  const context: PermissionContext = {
    userLevel: getUserLevel(user),
    featureFlags: permissionManager.getAllFlags(),
    databaseEnabled: permissionManager.isDatabaseEnabled(),
  }

  // Check if package has permissions defined
  if (!packageMetadata.permissions) {
    // No permissions defined = allow access
    return { allowed: true }
  }

  // Check package permissions
  const result = checkPackagePermissions(context, packageMetadata.permissions)

  if (!result.allowed) {
    console.warn(`Package ${packageId} access denied:`, result.reason)
    return {
      allowed: false,
      reason: result.reason,
    }
  }

  console.log(`Package ${packageId} access granted for user level ${context.userLevel}`)
  return { allowed: true }
}

/**
 * Example: Check component permissions before rendering
 */
export function canRenderComponent(
  componentName: string,
  packageMetadata: any,
  user: User | null
): { allowed: boolean; reason?: string } {
  // Build permission context
  const context: PermissionContext = {
    userLevel: getUserLevel(user),
    featureFlags: permissionManager.getAllFlags(),
    databaseEnabled: permissionManager.isDatabaseEnabled(),
  }

  // Check if component has specific permissions
  const componentPerms = packageMetadata.permissions?.components?.[componentName]

  if (!componentPerms) {
    // No component-specific permissions, check package level
    if (packageMetadata.permissions) {
      return checkPackagePermissions(context, packageMetadata.permissions)
    }
    // No permissions at all = allow
    return { allowed: true }
  }

  // Check component-specific permissions
  const result = checkComponentPermissions(context, componentPerms)

  if (!result.allowed) {
    console.warn(`Component ${componentName} access denied:`, result.reason)
  }

  return result
}

/**
 * Example: Filter components by permissions
 */
export function getAccessibleComponentsForUser(
  packageMetadata: any,
  user: User | null
): string[] {
  const context: PermissionContext = {
    userLevel: getUserLevel(user),
    featureFlags: permissionManager.getAllFlags(),
    databaseEnabled: permissionManager.isDatabaseEnabled(),
  }

  // Get all exported components
  const allComponents = packageMetadata.exports?.components || []

  // If no permissions defined, all components accessible
  if (!packageMetadata.permissions?.components) {
    return allComponents
  }

  // Filter by permissions
  const accessible = allComponents.filter((componentName: string) => {
    const perms = packageMetadata.permissions.components[componentName]
    if (!perms) return true // No restrictions

    const result = checkComponentPermissions(context, perms)
    return result.allowed
  })

  return accessible
}

/**
 * Example: Create permission-aware component wrapper
 */
export function createPermissionWrapper(
  componentName: string,
  packageMetadata: any,
  renderComponent: () => React.ReactNode,
  renderDenied: (reason?: string) => React.ReactNode
): (user: User | null) => React.ReactNode {
  return (user: User | null) => {
    const result = canRenderComponent(componentName, packageMetadata, user)

    if (result.allowed) {
      return renderComponent()
    }

    return renderDenied(result.reason)
  }
}

/**
 * Example: Renderer hook integration
 */
export async function renderPackageComponent(
  packageId: string,
  componentName: string,
  packageMetadata: any,
  user: User | null
): Promise<{ content: React.ReactNode | null; error?: string }> {
  // Check package permissions first
  const packageAccess = await loadPackageWithPermissions(packageId, packageMetadata, user)
  if (!packageAccess.allowed) {
    return {
      content: null,
      error: `Package access denied: ${packageAccess.reason}`,
    }
  }

  // Check component permissions
  const componentAccess = canRenderComponent(componentName, packageMetadata, user)
  if (!componentAccess.allowed) {
    return {
      content: null,
      error: `Component access denied: ${componentAccess.reason}`,
    }
  }

  // Both checks passed - proceed with rendering
  // (Actual rendering logic would go here)
  return {
    content: null, // Replace with actual rendered component
  }
}

/**
 * Example: Initialize permission system on app startup
 */
export function initializePermissionSystem(config?: {
  featureFlags?: Record<string, boolean>
  databaseEnabled?: boolean
}): void {
  // Initialize feature flags
  if (config?.featureFlags) {
    permissionManager.initializeFlags(config.featureFlags)
  }

  // Initialize database state
  if (config?.databaseEnabled !== undefined) {
    permissionManager.initializeDatabase(config.databaseEnabled)
  }

  console.log('Permission system initialized:', permissionManager.getState())
}

/**
 * Helper: Get user permission level from user object
 */
function getUserLevel(user: User | null): number {
  if (!user) return 0 // Public/anonymous

  // Map user role to permission level
  const roleMap: Record<string, number> = {
    public: 1,
    user: 2,
    moderator: 3,
    admin: 4,
    god: 5,
    supergod: 6,
  }

  return roleMap[user.role?.toLowerCase() || 'public'] ?? 1
}

/**
 * Example: Usage in a Next.js page
 */
/*
// In your page component:
import { useUser } from '@/lib/auth'
import { usePermissions } from '@/lib/packages/permissions'

export default function PackagePage() {
  const user = useUser()
  const permissions = usePermissions({ userLevel: getUserLevel(user) })

  // Check if user can access package
  const canAccess = permissions.checkPackage({
    enabled: true,
    minLevel: 3,
    databaseRequired: true,
  })

  if (!canAccess.allowed) {
    return <AccessDenied reason={canAccess.reason} />
  }

  return <PackageContent />
}
*/

/**
 * Example: Server-side permission check
 */
/*
// In an API route or server component:
import { getServerSession } from 'next-auth'
import { loadPackageWithPermissions } from '@/lib/packages/permissions/renderer-integration-example'

export async function GET(request: Request) {
  const session = await getServerSession()
  const packageMetadata = await loadPackageMetadata('audit_log')

  const access = await loadPackageWithPermissions(
    'audit_log',
    packageMetadata,
    session?.user || null
  )

  if (!access.allowed) {
    return Response.json(
      { error: access.reason },
      { status: 403 }
    )
  }

  // Continue with package operations...
}
*/
