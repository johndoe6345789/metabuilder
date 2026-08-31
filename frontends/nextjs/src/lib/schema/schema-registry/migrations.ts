import type { SchemaRegistry } from './registry-class'
import { coerceEntities, isMigrationEntry } from './migration-entry'

export interface PendingMigration {
  id: string
  packageId: string
  status: string
  queuedAt: string
  entities: Array<{ name: string }>
}

export function getPendingMigrations(
  registry: SchemaRegistry
): PendingMigration[] {
  return registry.migrationQueue
    .filter(isMigrationEntry)
    .filter(entry => entry.status === 'pending')
    .map(entry => ({
      id: entry.id,
      packageId: entry.packageId,
      status: entry.status,
      queuedAt: entry.queuedAt,
      entities: coerceEntities(entry.entities),
    }))
}

export { approveMigration, rejectMigration } from './migration-review'
