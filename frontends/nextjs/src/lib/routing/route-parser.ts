/**
 * Route parser (stub)
 */

export interface ParsedRoute {
  tenant?: string
  package?: string
  path?: string
  b_params: Record<string, string>
}

export const RESERVED_PATHS = ['api', 'admin', 'auth', '_next', 'static']

export function parseRoute(url: string): ParsedRoute {
  const result: ParsedRoute = { b_params: {} }
  
  // Split URL into path and query
  const [pathname = '', queryString] = url.split('?')
  
  // Parse query parameters
  if (queryString !== undefined && queryString.length > 0) {
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      result.b_params[key] = value
    })
  }
  
  // Parse path segments
  const segments = pathname.split('/').filter(s => s.length > 0)
  
  // Try to extract tenant/package/path from segments
  // Pattern: /{tenant}/{package}/...rest
  if (segments.length >= 1) {
    const firstSegment = segments[0]
    if (firstSegment !== undefined && !isReservedPath(firstSegment)) {
      result.tenant = firstSegment
    }
  }
  
  if (segments.length >= 2) {
    result.package = segments[1]
  }
  
  if (segments.length >= 3) {
    result.path = '/' + segments.slice(2).join('/')
  }
  
  return result
}

export function getPrefixedEntity(entity: string, prefix?: string): string {
  // TODO: Implement entity prefixing
  return prefix !== undefined && prefix.length > 0 ? `${prefix}_${entity}` : entity
}

export function getTableName(entity: string, tenantId?: string): string {
  // Convert entity name to lowercase and optionally prefix with tenant
  const tableName = entity.toLowerCase()
  
  // If tenant ID is provided, prefix the table name
  if (tenantId !== undefined && tenantId.length > 0) {
    return `${tenantId}_${tableName}`
  }
  
  return tableName
}

export function isReservedPath(path: string): boolean {
  // Get the first segment of the path
  const segment = path.startsWith('/') ? path.split('/')[1] : path.split('/')[0]
  
  // Check if the segment matches any reserved paths
  return segment !== undefined && RESERVED_PATHS.includes(segment)
}
