import type { SchemaRegistry } from './registry-class'

export type MigrationEntry = {
  id: string
  packageId: string
  status: string
  queuedAt: string
  entities: unknown
  approvedAt?: string
}

export function isMigrationEntry(value: unknown): value is MigrationEntry {
  if (value === null || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.packageId === 'string' &&
    typeof record.status === 'string' &&
    typeof record.queuedAt === 'string'
  )
}

export function coerceEntities(value: unknown): Array<{ name: string }> {
  if (!Array.isArray(value)) return []
  return value
    .map(entry => {
      if (typeof entry === 'string') return { name: entry }
      if (entry !== null && typeof entry === 'object') {
        const name = (entry as Record<string, unknown>).name
        if (typeof name === 'string') return { name }
      }
      return null
    })
    .filter((entry): entry is { name: string } => entry !== null)
}

export function findMigration(
  registry: SchemaRegistry,
  migrationId: string
): MigrationEntry | null {
  const entries = registry.migrationQueue.filter(isMigrationEntry)
  const entry = entries.find(
    item => item.id === migrationId && item.status === 'pending'
  )
  return entry ?? null
}
