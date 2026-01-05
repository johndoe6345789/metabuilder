/**
 * Schema registry (stub)
 */

import type { ModelSchema } from '../types/schema-types'

export class SchemaRegistry {
  private schemas: Map<string, ModelSchema> = new Map()

  register(schema: ModelSchema): void {
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

export async function loadSchemaRegistry(): Promise<SchemaRegistry> {
  // TODO: Implement schema registry loading
  return schemaRegistry
}

export async function saveSchemaRegistry(registry: SchemaRegistry): Promise<void> {
  // TODO: Implement schema registry saving
}

export async function getPendingMigrations(): Promise<unknown[]> {
  // TODO: Implement pending migrations retrieval
  return []
}

export async function generatePrismaFragment(schema: ModelSchema): Promise<string> {
  // TODO: Implement Prisma fragment generation
  return ''
}

export async function approveMigration(migrationId: string): Promise<void> {
  // TODO: Implement migration approval
}

export async function rejectMigration(migrationId: string): Promise<void> {
  // TODO: Implement migration rejection
}
