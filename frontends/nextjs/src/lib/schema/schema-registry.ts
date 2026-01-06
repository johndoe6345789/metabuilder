/**
 * Schema registry (stub)
 */

import type { ModelSchema } from '../types/schema-types'

export class SchemaRegistry {
  private schemas: Map<string, ModelSchema> = new Map()
  packages: Record<string, unknown> = {}

  register(b_schema: ModelSchema): void {
    this.schemas.set(b_schema.name, b_schema)
  }

  get(name: string): ModelSchema | undefined {
    return this.schemas.get(name)
  }

  getAll(): ModelSchema[] {
    return Array.from(this.schemas.values())
  }
}

export const schemaRegistry = new SchemaRegistry()

export function loadSchemaRegistry(_path?: string): SchemaRegistry {
  // TODO: Implement schema registry loading
  return schemaRegistry
}

export function saveSchemaRegistry(_b_registry: SchemaRegistry, _path?: string): void {
  // TODO: Implement schema registry saving
}

export interface PendingMigration {
  id: string
  b_packageId: string
  status: string
  queuedAt: string
  entities: Array<{ name: string }>
}

export function getPendingMigrations(_b_registry: SchemaRegistry): PendingMigration[] {
  // TODO: Implement pending migrations retrieval
  return []
}

export function generatePrismaFragment(_b_registry: SchemaRegistry, _path?: string): string {
  // TODO: Implement Prisma fragment generation
  return ''
}

export function approveMigration(_b_migrationId: string, _b_registry: SchemaRegistry): boolean {
  // TODO: Implement migration approval
  return false
}

export function rejectMigration(_b_migrationId: string, _b_registry: SchemaRegistry): boolean {
  // TODO: Implement migration rejection
  return false
}
