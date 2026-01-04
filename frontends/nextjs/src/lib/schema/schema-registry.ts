// TODO: Implement schema registry
export const schemaRegistry = {}
export const loadSchemaRegistry = (path?: string) => ({
  packages: {} as Record<string, any>
})
export const saveSchemaRegistry = (data: any, path?: string) => true
export const getPendingMigrations = (registry: any) => []
export const generatePrismaFragment = (schema: any, options?: any) => ''
export const approveMigration = (id: string, registry?: any) => true
export const rejectMigration = (id: string, registry?: any) => true
export type SchemaRegistry = { packages: Record<string, any> }
