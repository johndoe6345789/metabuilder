/**
 * Reading a URL as tenant, package and the rest.
 *
 * The first segment is a tenant unless it names an application route --
 * `/api/...` is the API, not a tenant called "api".
 */

export interface ParsedRoute {
  tenant?: string
  package?: string
  path?: string
  b_params: Record<string, string>
}

export const RESERVED_PATHS = [
  'api',
  'admin',
  'auth',
  '_next',
  'static',
  'app',
  'ui',
  'dbal-daemon',
  'levels',
  'public',
]

export function parseRoute(url: string): ParsedRoute {
  const result: ParsedRoute = { b_params: {} }

  // Split URL into path and query. .at() is typed `string | undefined`
  // under both tsconfig variants (unlike destructuring from split()'s
  // `string[]`), and a url with no `?` genuinely produces a 1-element
  // array at runtime -- this check is real, not just satisfying strict.
  const urlParts = url.split('?')
  const pathname = urlParts.at(0) ?? ''
  const queryString = urlParts.at(1)

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
  const firstSegment = segments.at(0)
  if (firstSegment !== undefined && !isReservedPath(firstSegment)) {
    result.tenant = firstSegment
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
  return prefix !== undefined && prefix.length > 0
    ? `${prefix}_${entity}`
    : entity
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
  // Normalize path to get the first segment
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  // String.split() always returns at least one element, so this is never
  // undefined -- unlike the array-index cases above.
  const [segment] = normalizedPath.split('/')

  // Check if the segment matches any reserved paths
  return RESERVED_PATHS.includes(segment)
}
