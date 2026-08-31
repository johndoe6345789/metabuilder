import type { SchemaRegistry } from './registry-class'
import { findMigration } from './migration-entry'

export function approveMigration(
  migrationId: string,
  registry: SchemaRegistry
): boolean {
  const entry = findMigration(registry, migrationId)
  if (entry === null) return false
  entry.status = 'approved'
  entry.approvedAt = new Date().toISOString()
  return true
}

export function rejectMigration(
  migrationId: string,
  registry: SchemaRegistry
): boolean {
  const entry = findMigration(registry, migrationId)
  if (entry === null) return false
  entry.status = 'rejected'
  return true
}
