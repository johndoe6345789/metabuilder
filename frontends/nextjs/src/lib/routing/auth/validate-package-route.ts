/**
 * Package route claiming and validation
 * 
 * Packages can claim routes through their metadata.json:
 * - minLevel: Required permission level
 * - routes: Optional custom route definitions
 * - schema.entities: Auto-generates CRUD routes for entities
 */

import * as fs from 'fs'
import * as path from 'path'

import type { SessionUser } from './get-session-user'

export interface PackageRoute {
  path: string
  method?: string | string[]
  handler?: string
  level?: number
  description?: string
}

/**
 * Permission definition for a specific action
 */
export interface PackagePermissionDef {
  /** Minimum level required to use this permission */
  minLevel: number
  /** Human-readable description of what this permission allows */
  description: string
  /** Optional feature flags that must be enabled */
  featureFlags?: string[]
  /** Whether database connection is required */
  requireDatabase?: boolean
}

/**
 * Package permissions map
 * Key is the permission identifier (e.g., "forum.post.create")
 * Value is the permission definition
 */
export type PackagePermissions = Record<string, PackagePermissionDef>

export interface PackageMetadata {
  packageId: string
  name: string
  version: string
  description?: string
  minLevel: number
  /** Whether this package can be the primary package for a route (default: true) */
  primary?: boolean
  /** Package dependencies that this package can access */
  dependencies?: string[]
  /** Dev dependencies (not included in runtime) */
  devDependencies?: string[]
  routes?: PackageRoute[]
  schema?: {
    entities?: string[]
    path?: string
  }
  exports?: {
    components?: string[]
    scripts?: string[]
  }
  /** 
   * Fine-grained permissions declared by this package
   * Keys are permission identifiers like "forum.post.create"
   */
  permissions?: PackagePermissions
}

export interface RouteClaimResult {
  allowed: boolean
  package: PackageMetadata | null
  reason?: string
  entities?: string[]
  /** Packages accessible from this route (primary + dependencies) */
  accessiblePackages?: string[]
}

// Cache loaded package metadata
const packageCache = new Map<string, PackageMetadata | null>()

/**
 * Load package metadata from disk
 */
export const loadPackageMetadata = (packageId: string): PackageMetadata | null => {
  // Check cache first
  if (packageCache.has(packageId)) {
    return packageCache.get(packageId) || null
  }

  // Try multiple possible locations
  const possiblePaths = [
    path.join(process.cwd(), '..', '..', 'packages', packageId, 'seed', 'metadata.json'),
    path.join(process.cwd(), 'packages', packageId, 'seed', 'metadata.json'),
    path.join(process.cwd(), '..', 'packages', packageId, 'seed', 'metadata.json'),
  ]

  for (const metadataPath of possiblePaths) {
    try {
      if (fs.existsSync(metadataPath)) {
        const content = fs.readFileSync(metadataPath, 'utf-8')
        const metadata = JSON.parse(content) as PackageMetadata
        packageCache.set(packageId, metadata)
        return metadata
      }
    } catch {
      // Continue to next path
    }
  }

  packageCache.set(packageId, null)
  return null
}

/**
 * Clear the package metadata cache
 */
export const clearPackageCache = (): void => {
  packageCache.clear()
}

/**
 * Check if a package can be a primary package (own routes)
 * Returns false if package has `primary: false` in metadata
 */
export const canBePrimaryPackage = (packageId: string): boolean => {
  const metadata = loadPackageMetadata(packageId)
  if (!metadata) return false
  return metadata.primary !== false
}

/**
 * Check if a user has a specific permission from a package
 */
export const hasPermission = (
  user: SessionUser | null,
  packageId: string,
  permission: string
): boolean => {
  const metadata = loadPackageMetadata(packageId)
  if (!metadata) return false
  
  // If no permissions defined, fall back to minLevel check
  if (!metadata.permissions) {
    return (user?.level ?? 0) >= metadata.minLevel
  }
  
  const permDef = metadata.permissions[permission]
  if (!permDef) return false
  
  return (user?.level ?? 0) >= permDef.minLevel
}

/**
 * Get all permissions a user has for a package
 */
export const getUserPermissions = (
  user: SessionUser | null,
  packageId: string
): string[] => {
  const metadata = loadPackageMetadata(packageId)
  if (!metadata?.permissions) return []
  
  const userLevel = user?.level ?? 0
  return Object.entries(metadata.permissions)
    .filter(([, def]) => userLevel >= def.minLevel)
    .map(([perm]) => perm)
}

/**
 * Get all declared permissions for a package
 */
export const getPackagePermissions = (
  packageId: string
): PackagePermissions | null => {
  const metadata = loadPackageMetadata(packageId)
  return metadata?.permissions ?? null
}

/**
 * Get available entities for a package
 * These are auto-generated CRUD routes from the schema
 */
export const getPackageEntities = (metadata: PackageMetadata): string[] => {
  if (!metadata.schema?.entities) {
    return []
  }
  return metadata.schema.entities
}

/**
 * Validate that a user can access a package route
 */
export const validatePackageRoute = (
  packageId: string,
  entity: string | null,
  user: SessionUser | null,
  /** If true, checks if package can be primary (own a route). If false, only checks access. */
  requirePrimary: boolean = true
): RouteClaimResult => {
  const metadata = loadPackageMetadata(packageId)

  if (!metadata) {
    return {
      allowed: false,
      package: null,
      reason: `Package not found: ${packageId}`,
    }
  }

  // Check if package can be primary (default true for backwards compatibility)
  const canBePrimary = metadata.primary !== false
  if (requirePrimary && !canBePrimary) {
    return {
      allowed: false,
      package: metadata,
      reason: `Package '${packageId}' cannot be a primary package (primary: false). It can only be used as a dependency.`,
    }
  }

  const requiredLevel = metadata.minLevel || 1
  const entities = getPackageEntities(metadata)

  // Public routes (level 1) allow anonymous access
  if (requiredLevel <= 1) {
    return {
      allowed: true,
      package: metadata,
      entities,
    }
  }

  // Higher levels require authentication
  if (!user) {
    return {
      allowed: false,
      package: metadata,
      reason: 'Authentication required',
      entities,
    }
  }

  // Check user level
  if (user.level < requiredLevel) {
    return {
      allowed: false,
      package: metadata,
      reason: `Insufficient permission level (need ${requiredLevel}, have ${user.level})`,
      entities,
    }
  }

  // If entity specified, verify it's declared in schema
  if (entity && entities.length > 0) {
    const normalizedEntity = entity.toLowerCase()
    const entityExists = entities.some(
      e => e.toLowerCase() === normalizedEntity
    )
    
    if (!entityExists) {
      return {
        allowed: false,
        package: metadata,
        reason: `Entity '${entity}' not declared in package schema. Available: ${entities.join(', ')}`,
        entities,
      }
    }
  }

  // Build list of accessible packages (primary + dependencies)
  const accessiblePackages = [packageId, ...(metadata.dependencies || [])]

  return {
    allowed: true,
    package: metadata,
    entities,
    accessiblePackages,
  }
}

/**
 * Get all packages accessible from a primary package
 * Returns primary package + all dependencies
 */
export const getAccessiblePackages = (primaryPackageId: string): string[] => {
  const metadata = loadPackageMetadata(primaryPackageId)
  if (!metadata) {
    return [primaryPackageId]
  }
  return [primaryPackageId, ...(metadata.dependencies || [])]
}

/**
 * Check if targetPackage is accessible from primaryPackage
 * (either the same package or a declared dependency)
 */
export const isPackageAccessible = (
  primaryPackageId: string,
  targetPackageId: string
): boolean => {
  if (primaryPackageId === targetPackageId) {
    return true
  }
  const metadata = loadPackageMetadata(primaryPackageId)
  return metadata?.dependencies?.includes(targetPackageId) || false
}

/**
 * Get all routes claimed by a package
 */
export const getPackageRoutes = (packageId: string): PackageRoute[] => {
  const metadata = loadPackageMetadata(packageId)
  if (!metadata) {
    return []
  }

  const routes: PackageRoute[] = []
  const minLevel = metadata.minLevel || 1

  // Add explicit routes from metadata
  if (metadata.routes) {
    routes.push(...metadata.routes)
  }

  // Auto-generate CRUD routes for schema entities
  const entities = getPackageEntities(metadata)
  for (const entity of entities) {
    const basePath = `/${entity.toLowerCase()}`
    
    routes.push(
      { path: basePath, method: 'GET', handler: 'list', level: minLevel },
      { path: basePath, method: 'POST', handler: 'create', level: minLevel },
      { path: `${basePath}/:id`, method: 'GET', handler: 'read', level: minLevel },
      { path: `${basePath}/:id`, method: 'PUT', handler: 'update', level: minLevel },
      { path: `${basePath}/:id`, method: 'PATCH', handler: 'patch', level: minLevel },
      { path: `${basePath}/:id`, method: 'DELETE', handler: 'delete', level: minLevel }
    )
  }

  return routes
}

/**
 * Check if a package claims a specific route pattern
 */
export const packageClaimsRoute = (
  packageId: string,
  entityPath: string,
  method: string
): boolean => {
  const routes = getPackageRoutes(packageId)
  const normalizedPath = entityPath.toLowerCase()
  const normalizedMethod = method.toUpperCase()

  return routes.some(route => {
    // Match path (handle :id wildcards)
    const routePattern = route.path.toLowerCase().replace(/:id/g, '[^/]+')
    const regex = new RegExp(`^${routePattern}$`)
    if (!regex.test(normalizedPath)) {
      return false
    }

    // Match method
    const methods = Array.isArray(route.method) 
      ? route.method.map(m => m.toUpperCase())
      : [route.method?.toUpperCase() || 'GET']
    
    return methods.includes(normalizedMethod)
  })
}
