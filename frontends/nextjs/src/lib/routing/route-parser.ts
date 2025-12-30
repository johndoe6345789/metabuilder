/**
 * RESTful Route Parser
 * 
 * Unified routing pattern: /{tenant}/{package}/{entity}[/{id}[/{action}]]
 * 
 * This module provides consistent route parsing across the entire application:
 * - Next.js API routes
 * - C++ DBAL daemon
 * - CLI tools
 */

/**
 * Parsed route information
 */
export interface RouteInfo {
  tenant: string
  package: string
  entity: string
  id?: string
  action?: string
  extraArgs: string[]
  valid: boolean
  error?: string
}

/**
 * Convert snake_case to PascalCase
 */
export function toPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

/**
 * Convert string to lowercase
 */
export function toLower(str: string): string {
  return str.toLowerCase()
}

/**
 * Get prefixed entity name for DBAL
 * Format: Pkg_{PascalPackage}_{Entity}
 */
export function getPrefixedEntity(packageId: string, entity: string): string {
  return `Pkg_${toPascalCase(packageId)}_${toPascalCase(entity)}`
}

/**
 * Get table name for entity
 * Format: {package}_{lowercase_entity}
 */
export function getTableName(packageId: string, entity: string): string {
  return `${packageId}_${toLower(entity)}`
}

/**
 * Validate name (alphanumeric + underscore)
 */
function isValidName(name: string): boolean {
  if (!name) return false
  return /^[a-zA-Z0-9_]+$/.test(name)
}

/**
 * Parse a RESTful path into route components
 * 
 * @param pathSegments Array of path segments (from Next.js dynamic routes or split path)
 * @returns Parsed RouteInfo
 */
export function parseRoute(pathSegments: string[]): RouteInfo {
  const info: RouteInfo = {
    tenant: '',
    package: '',
    entity: '',
    extraArgs: [],
    valid: false,
  }

  // Need at least tenant/package/entity
  if (pathSegments.length < 3) {
    info.error = 'Path requires at least: /{tenant}/{package}/{entity}'
    return info
  }

  info.tenant = pathSegments[0]
  info.package = pathSegments[1]
  info.entity = pathSegments[2]

  // Optional: ID
  if (pathSegments.length > 3) {
    info.id = pathSegments[3]
  }

  // Optional: Action
  if (pathSegments.length > 4) {
    info.action = pathSegments[4]
  }

  // Extra args
  for (let i = 5; i < pathSegments.length; i++) {
    info.extraArgs.push(pathSegments[i])
  }

  // Validate names
  if (!isValidName(info.tenant)) {
    info.error = `Invalid tenant name: ${info.tenant}`
    return info
  }

  if (!isValidName(info.package)) {
    info.error = `Invalid package name: ${info.package}`
    return info
  }

  if (!isValidName(info.entity)) {
    info.error = `Invalid entity name: ${info.entity}`
    return info
  }

  info.valid = true
  return info
}

/**
 * Parse path string into route
 */
export function parseRoutePath(path: string): RouteInfo {
  // Remove leading/trailing slashes and split
  const cleanPath = path.replace(/^\/+|\/+$/g, '')
  const segments = cleanPath.split('/').filter(Boolean)
  return parseRoute(segments)
}

/**
 * Determine CRUD operation from HTTP method and route
 */
export function getOperation(method: string, route: RouteInfo): string {
  const upperMethod = method.toUpperCase()

  if (upperMethod === 'GET') {
    if (!route.id) return 'list'
    if (route.action) return route.action
    return 'read'
  }

  if (upperMethod === 'POST') {
    if (!route.id) return 'create'
    if (route.action) return route.action
    return 'create'
  }

  if (upperMethod === 'PUT' || upperMethod === 'PATCH') {
    return 'update'
  }

  if (upperMethod === 'DELETE') {
    return 'delete'
  }

  return 'unknown'
}

/**
 * Build DBAL operation from route and request
 */
export interface DbalOperation {
  entity: string
  operation: string
  tenantId: string
  id?: string
  payload?: Record<string, unknown>
  options?: {
    where?: Record<string, unknown>
    take?: number
    skip?: number
    orderBy?: Record<string, 'asc' | 'desc'>
  }
}

export function buildDbalOperation(
  route: RouteInfo,
  method: string,
  body?: Record<string, unknown>,
  query?: Record<string, string>
): DbalOperation {
  const operation = getOperation(method, route)
  const prefixedEntity = getPrefixedEntity(route.package, route.entity)

  const dbalOp: DbalOperation = {
    entity: prefixedEntity,
    operation,
    tenantId: route.tenant,
  }

  if (route.id) {
    dbalOp.id = route.id
  }

  // Build options for list operations
  if (operation === 'list' && query) {
    const options: DbalOperation['options'] = {
      where: { tenantId: route.tenant },
    }

    for (const [key, value] of Object.entries(query)) {
      if (key === 'take' || key === 'limit') {
        options.take = parseInt(value, 10)
      } else if (key === 'skip' || key === 'offset') {
        options.skip = parseInt(value, 10)
      } else if (key.startsWith('where.')) {
        options.where = options.where || {}
        options.where[key.slice(6)] = value
      } else if (key.startsWith('orderBy.')) {
        options.orderBy = options.orderBy || {}
        options.orderBy[key.slice(8)] = value as 'asc' | 'desc'
      }
    }

    dbalOp.options = options
  }

  // For create/update, include body as payload
  if ((operation === 'create' || operation === 'update') && body) {
    dbalOp.payload = {
      ...body,
      tenantId: route.tenant, // Enforce tenant
    }
  }

  return dbalOp
}

/**
 * Reserved paths that should not be treated as tenant routes
 */
export const RESERVED_PATHS = [
  'api',
  'auth',
  'login',
  'logout',
  'health',
  'status',
  '_next',
  'static',
  'favicon.ico',
]

/**
 * Check if a path segment is a reserved system path
 */
export function isReservedPath(segment: string): boolean {
  return RESERVED_PATHS.includes(segment.toLowerCase())
}
