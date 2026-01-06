/**
 * Schema registry for dynamic schema management
 */

import type { ModelSchema } from '../types/schema-types'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export class SchemaRegistry {
  private schemas: Map<string, ModelSchema> = new Map()
  packages: Record<string, unknown> = {}

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

export function loadSchemaRegistry(path?: string): SchemaRegistry {
  const schemaPath = path ?? join(process.cwd(), 'schemas', 'registry.json')
  
  if (!existsSync(schemaPath)) {
    return schemaRegistry
  }

  try {
    const data = readFileSync(schemaPath, 'utf-8')
    const parsed: unknown = JSON.parse(data)
    
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const { schemas, packages } = parsed as { schemas?: unknown; packages?: unknown }
      
      if (Array.isArray(schemas)) {
        schemas.forEach((schema: ModelSchema) => schemaRegistry.register(schema))
      }
      
      if (packages !== null && packages !== undefined && typeof packages === 'object') {
        schemaRegistry.packages = packages as Record<string, unknown>
      }
    }
  } catch (error) {
    console.warn(`Failed to load schema registry from ${schemaPath}:`, error instanceof Error ? error.message : String(error))
  }

  return schemaRegistry
}

export function saveSchemaRegistry(registry: SchemaRegistry, path?: string): void {
  const schemaPath = path ?? join(process.cwd(), 'schemas', 'registry.json')
  
  try {
    const data = {
      schemas: registry.getAll(),
      packages: registry.packages,
    }
    writeFileSync(schemaPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Failed to save schema registry to ${schemaPath}:`, error instanceof Error ? error.message : String(error))
  }
}

export interface PendingMigration {
  id: string
  packageId: string
  status: string
  queuedAt: string
  entities: Array<{ name: string }>
}

export function getPendingMigrations(_registry: SchemaRegistry): PendingMigration[] {
  // TODO: Implement pending migrations retrieval from database
  return []
}

export function generatePrismaFragment(registry: SchemaRegistry, _path?: string): string {
  // Generate Prisma schema fragments from registered schemas
  const schemas = registry.getAll()
  const fragments: string[] = []

  for (const schema of schemas) {
    fragments.push(`// Model: ${schema.name}`)
    fragments.push(`model ${schema.name} {`)
    
    // Add fields - this is a simplified version
    // Real implementation would need proper field mapping
    fragments.push('  id String @id @default(cuid())')
    fragments.push('  createdAt DateTime @default(now())')
    fragments.push('  updatedAt DateTime @updatedAt')
    
    fragments.push('}')
    fragments.push('')
  }

  return fragments.join('\n')
}

export function approveMigration(_migrationId: string, _registry: SchemaRegistry): boolean {
  // TODO: Implement migration approval - update database status
  return false
}

export function rejectMigration(_migrationId: string, _registry: SchemaRegistry): boolean {
  // TODO: Implement migration rejection - update database status
  return false
}
