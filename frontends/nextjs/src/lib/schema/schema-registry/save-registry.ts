import { writeFileSync } from 'fs'
import { join } from 'path'
import type { ModelSchema } from '../../types/schema-types'
import type { SchemaRegistry } from './registry-class'
import { safeParseJson } from './safe-parse-json'

function buildEntitiesIndex(schemas: ModelSchema[]): Record<string, unknown> {
  const entities: Record<string, unknown> = {}
  for (const schema of schemas) {
    entities[schema.name] = { fields: safeParseJson(schema.fields) ?? [] }
  }
  return entities
}

export function saveSchemaRegistry(
  registry: SchemaRegistry,
  path?: string
): void {
  const schemaPath = path ?? join(process.cwd(), 'schemas', 'registry.json')

  try {
    const data = {
      version: '1.0.0',
      schemas: registry.getAll(),
      packages: registry.packages,
      entities: buildEntitiesIndex(registry.getAll()),
      migrationQueue: registry.migrationQueue,
    }
    writeFileSync(schemaPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(
      `Failed to save schema registry to ${schemaPath}:`,
      error instanceof Error ? error.message : String(error)
    )
  }
}
