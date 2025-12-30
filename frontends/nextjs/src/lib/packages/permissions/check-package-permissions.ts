/**
 * Package and component permission checking for TypeScript/Next.js
 * Mirrors the Lua permission system for consistent access control
 */

export type PermissionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface ComponentPermission {
  enabled: boolean
  minLevel: PermissionLevel
  featureFlags?: string[]
  requireDatabase?: boolean
}

export interface PackagePermissions {
  enabled: boolean
  minLevel: PermissionLevel
  databaseRequired?: boolean
  components?: Record<string, ComponentPermission>
}

export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  requiredLevel?: PermissionLevel
}

export interface PermissionContext {
  userLevel: PermissionLevel
  featureFlags?: Record<string, boolean>
  databaseEnabled?: boolean
}

/**
 * Check if user has permission to access a resource
 */
export function checkAccess(
  userLevel: PermissionLevel,
  permissions: PackagePermissions | ComponentPermission,
  featureFlags: Record<string, boolean> = {},
  databaseEnabled: boolean = true
): PermissionCheckResult {
  // Check if resource is enabled
  if (permissions.enabled === false) {
    return {
      allowed: false,
      reason: 'Resource is currently disabled',
    }
  }

  // Check minimum permission level
  const minLevel = permissions.minLevel ?? 0
  if (userLevel < minLevel) {
    return {
      allowed: false,
      reason: 'Insufficient permission level',
      requiredLevel: minLevel,
    }
  }

  // Check database requirement
  if ('databaseRequired' in permissions && permissions.databaseRequired && !databaseEnabled) {
    return {
      allowed: false,
      reason: 'Database is required but not enabled',
    }
  }

  if ('requireDatabase' in permissions && permissions.requireDatabase && !databaseEnabled) {
    return {
      allowed: false,
      reason: 'Database is required but not enabled',
    }
  }

  // Check feature flags (only if specified)
  if ('featureFlags' in permissions && permissions.featureFlags) {
    for (const flag of permissions.featureFlags) {
      if (!featureFlags[flag]) {
        return {
          allowed: false,
          reason: `Required feature flag '${flag}' is not enabled`,
        }
      }
    }
  }

  // All checks passed
  return { allowed: true }
}

/**
 * Check package permissions
 */
export function checkPackagePermissions(
  context: PermissionContext,
  permissions: PackagePermissions
): PermissionCheckResult {
  return checkAccess(
    context.userLevel,
    permissions,
    context.featureFlags ?? {},
    context.databaseEnabled ?? true
  )
}

/**
 * Check component permissions
 */
export function checkComponentPermissions(
  context: PermissionContext,
  permissions: ComponentPermission
): PermissionCheckResult {
  return checkAccess(
    context.userLevel,
    permissions,
    context.featureFlags ?? {},
    context.databaseEnabled ?? true
  )
}

/**
 * Filter components based on permissions
 */
export function getAccessibleComponents(
  context: PermissionContext,
  componentPermissions: Record<string, ComponentPermission>
): string[] {
  const accessible: string[] = []

  for (const [componentName, permissions] of Object.entries(componentPermissions)) {
    const result = checkComponentPermissions(context, permissions)
    if (result.allowed) {
      accessible.push(componentName)
    }
  }

  return accessible
}

/**
 * Get permission denial message for UI display
 */
export function getPermissionDenialMessage(result: PermissionCheckResult): string {
  if (result.allowed) {
    return ''
  }

  if (result.reason) {
    if (result.requiredLevel !== undefined) {
      return `${result.reason} (Required: Level ${result.requiredLevel})`
    }
    return result.reason
  }

  return 'Access denied'
}

/**
 * Convert user role string to permission level
 */
export function roleToLevel(role: string): PermissionLevel {
  const roleMap: Record<string, PermissionLevel> = {
    public: 1,
    user: 2,
    moderator: 3,
    admin: 4,
    god: 5,
    supergod: 6,
  }

  return roleMap[role.toLowerCase()] ?? 1
}

/**
 * Convert permission level to role string
 */
export function levelToRole(level: PermissionLevel): string {
  const levelMap: Record<PermissionLevel, string> = {
    0: 'public',
    1: 'public',
    2: 'user',
    3: 'moderator',
    4: 'admin',
    5: 'god',
    6: 'supergod',
  }

  return levelMap[level] ?? 'public'
}

/**
 * Check if user level meets or exceeds required level
 */
export function meetsLevelRequirement(
  userLevel: PermissionLevel,
  requiredLevel: PermissionLevel
): boolean {
  return userLevel >= requiredLevel
}
