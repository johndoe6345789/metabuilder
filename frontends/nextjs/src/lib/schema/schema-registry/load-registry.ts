import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { schemaRegistry, type SchemaRegistry } from './registry-class'
import { normalizeSchema } from './normalize-schema'

type JsonRecord = Record<string, unknown>

function loadSchemasArray(schemas: unknown): void {
  if (!Array.isArray(schemas)) return
  schemas.forEach(schema => {
    const normalized = normalizeSchema(schema as JsonRecord)
    if (normalized !== null) schemaRegistry.register(normalized)
  })
}

function loadEntitiesMap(entities: unknown): void {
  if (
    entities === null ||
    entities === undefined ||
    typeof entities !== 'object' ||
    Array.isArray(entities)
  ) {
    return
  }
  Object.entries(entities as JsonRecord).forEach(([name, value]) => {
    if (value === null || value === undefined) return
    const raw = value as JsonRecord
    const normalized = normalizeSchema({
      ...(typeof raw === 'object' ? raw : {}),
      name,
      fields: raw.fields ?? raw,
    })
    if (normalized !== null) schemaRegistry.register(normalized)
  })
}

/** Repopulates the shared schemaRegistry singleton from a JSON file on
 *  disk -- a missing or unreadable file just leaves the registry
 *  empty rather than throwing, since "no schemas yet" is a normal
 *  first-boot state. */
export function loadSchemaRegistry(path?: string): SchemaRegistry {
  const schemaPath = path ?? join(process.cwd(), 'schemas', 'registry.json')

  schemaRegistry.clear()
  if (!existsSync(schemaPath)) return schemaRegistry

  try {
    const parsed: unknown = JSON.parse(readFileSync(schemaPath, 'utf-8'))
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return schemaRegistry
    }

    const { schemas, packages, entities, migrationQueue } = parsed as {
      schemas?: unknown
      packages?: unknown
      entities?: unknown
      migrationQueue?: unknown
    }

    loadSchemasArray(schemas)
    loadEntitiesMap(entities)

    if (packages !== null && packages !== undefined && typeof packages === 'object') {
      schemaRegistry.packages = packages as Record<string, unknown>
    }
    if (Array.isArray(migrationQueue)) {
      schemaRegistry.migrationQueue = migrationQueue
    }
  } catch (error) {
    console.warn(
      `Failed to load schema registry from ${schemaPath}:`,
      error instanceof Error ? error.message : String(error)
    )
  }

  return schemaRegistry
}
