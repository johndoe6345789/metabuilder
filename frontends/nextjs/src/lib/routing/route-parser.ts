/**
 * Route parser (stub)
 */

export interface ParsedRoute {
  tenant?: string
  package?: string
  path?: string
  params: Record<string, string>
}

export const RESERVED_PATHS = ['api', 'admin', 'auth', '_next', 'static']

export function parseRoute(url: string): ParsedRoute {
  // TODO: Implement route parsing
  return { params: {} }
}

export function getPrefixedEntity(entity: string, prefix?: string): string {
  // TODO: Implement entity prefixing
  return prefix ? `${prefix}_${entity}` : entity
}

export function getTableName(entity: string, tenantId?: string): string {
  // TODO: Implement table name resolution
  return entity.toLowerCase()
}

export function isReservedPath(path: string): boolean {
  // TODO: Implement reserved path checking
  return RESERVED_PATHS.includes(path.split('/')[1] || path)
}
