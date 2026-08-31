/**
 * Schema registry for dynamic schema management
 */

export { SchemaRegistry, schemaRegistry } from './schema-registry/registry-class'
export { loadSchemaRegistry } from './schema-registry/load-registry'
export { saveSchemaRegistry } from './schema-registry/save-registry'
export { generateSchemaFragment } from './schema-registry/generate-fragment'
export type { PendingMigration } from './schema-registry/migrations'
export {
  getPendingMigrations,
  approveMigration,
  rejectMigration,
} from './schema-registry/migrations'
