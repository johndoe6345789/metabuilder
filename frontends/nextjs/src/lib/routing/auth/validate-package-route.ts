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

export interface PackageMetadata {
  packageId: string
  name: string
  version: string
  description?: string
  minLevel: number
  routes?: PackageRoute[]
  schema?: {
    entities?: string[]
    path?: string
  }
  exports?: {
    components?: string[]
    scripts?: string[]
  }
}

export interface RouteClaimResult {
  allowed: boolean
  package: PackageMetadata | null
  reason?: string
  entities?: string[]
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
  user: SessionUser | null
): RouteClaimResult => {
  const metadata = loadPackageMetadata(packageId)

  if (!metadata) {
    return {
      allowed: false,
      package: null,
      reason: `Package not found: ${packageId}`,
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

  return {
    allowed: true,
    package: metadata,
    entities,
  }
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
