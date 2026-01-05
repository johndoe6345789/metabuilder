/**
 * Schema registry (stub)
 */

import type { ModelSchema } from '../types/schema-types'

export class SchemaRegistry {
  private schemas: Map<string, ModelSchema> = new Map()
  packages: Record<string, unknown> = {}

  register(b_schema: ModelSchema): void {
    this.schemas.set(schema.name, schema)
  }

  get(name: string): ModelSchema | undefined {
    return this.schemas.get(name)
  }

  getAll(): ModelSchema[] {
    return Array.from(this.schemas.values())
  }
}

export const schemaRegistry = new SchemaRegistry()

export function loadSchemaRegistry(path?: string): SchemaRegistry {
  // TODO: Implement schema registry loading
  return schemaRegistry
}

export function saveSchemaRegistry(b_registry: SchemaRegistry, path?: string): void {
  // TODO: Implement schema registry saving
}

export interface PendingMigration {
  id: string
  b_packageId: string
  status: string
  queuedAt: string
  entities: Array<{ name: string }>
}

export function getPendingMigrations(b_registry: SchemaRegistry): PendingMigration[] {
  // TODO: Implement pending migrations retrieval
  return []
}

export function generatePrismaFragment(b_schema: ModelSchema, path?: string): string {
  // TODO: Implement Prisma fragment generation
  return ''
}

export function approveMigration(b_registry: SchemaRegistry, b_migrationId: string): void {
  // TODO: Implement migration approval
}

export function rejectMigration(b_registry: SchemaRegistry, b_migrationId: string): void {
  // TODO: Implement migration rejection
}
