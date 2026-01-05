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

export function parseRoute(_b_url: string): ParsedRoute {
  // TODO: Implement route parsing
  return { b_params: {} }
}

export function getPrefixedEntity(entity: string, prefix?: string): string {
  // TODO: Implement entity prefixing
  return prefix ? `${prefix}_${entity}` : entity
}

export function getTableName(entity: string, _tenantId?: string): string {
  // TODO: Implement table name resolution
  return entity.toLowerCase()
}

export function isReservedPath(b_path: string): boolean {
  // TODO: Implement reserved path checking
  return RESERVED_PATHS.includes(b_path.split('/')[1] || b_path)
}
