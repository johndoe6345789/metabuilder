// TODO: Implement route parser
export const parseRoute = (route: string) => ({ path: route })
export const isReservedPath = (path: string) => false
export const RESERVED_PATHS = [] as string[]
export const getPrefixedEntity = (entity: string, prefix?: string) => prefix ? `${prefix}_${entity}` : entity
export const getTableName = (entity: string, prefix?: string) => prefix ? `${prefix}_${entity}` : entity
