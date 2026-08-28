/**
 * Schema registry for dynamic schema management
 */

import type { ModelSchema } from '../types/schema-types'
import { readFileSync, writeFileSync, existsSync } from 'fs'

import { renderSchemaField, type FieldSpec } from './render-field'
import { join } from 'path'

type JsonRecord = Record<string, unknown>

export class SchemaRegistry {
  private readonly schemas: Map<string, ModelSchema> = new Map()
  packages: Record<string, unknown> = {}
  migrationQueue: unknown[] = []

  clear(): void {
    this.schemas.clear()
    this.packages = {}
    this.migrationQueue = []
  }

  register(schema: ModelSchema): void {
    this.schemas.set(schema.id, schema)
  }

  get(key: string): ModelSchema | undefined {
    const direct = this.schemas.get(key)
    if (direct !== undefined) return direct

    return Array.from(this.schemas.values()).find(schema => schema.name === key)
  }

  has(key: string): boolean {
    return this.schemas.has(key)
  }

  getAll(): ModelSchema[] {
    return Array.from(this.schemas.values())
  }
}

export const schemaRegistry = new SchemaRegistry()

export function loadSchemaRegistry(path?: string): SchemaRegistry {
  const schemaPath = path ?? join(process.cwd(), 'schemas', 'registry.json')

  schemaRegistry.clear()

  if (!existsSync(schemaPath)) {
    return schemaRegistry
  }

  try {
    const data = readFileSync(schemaPath, 'utf-8')
    const parsed: unknown = JSON.parse(data)

    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      const { schemas, packages, entities, migrationQueue } = parsed as {
        schemas?: unknown
        packages?: unknown
        entities?: unknown
        migrationQueue?: unknown
      }

      if (Array.isArray(schemas)) {
        schemas.forEach(schema => {
          const normalized = normalizeSchema(schema as JsonRecord)
          if (normalized !== null) schemaRegistry.register(normalized)
        })
      }

      if (
        entities !== null &&
        entities !== undefined &&
        typeof entities === 'object' &&
        !Array.isArray(entities)
      ) {
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

      if (
        packages !== null &&
        packages !== undefined &&
        typeof packages === 'object'
      ) {
        schemaRegistry.packages = packages as Record<string, unknown>
      }

      if (Array.isArray(migrationQueue)) {
        schemaRegistry.migrationQueue = migrationQueue
      }
    }
  } catch (error) {
    console.warn(
      `Failed to load schema registry from ${schemaPath}:`,
      error instanceof Error ? error.message : String(error)
    )
  }

  return schemaRegistry
}

export function saveSchemaRegistry(
  registry: SchemaRegistry,
  path?: string
): void {
  const schemaPath = path ?? join(process.cwd(), 'schemas', 'registry.json')

  try {
    const entities = buildEntitiesIndex(registry.getAll())
    const data = {
      version: '1.0.0',
      schemas: registry.getAll(),
      packages: registry.packages,
      entities,
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

export function generateSchemaFragment(
  registry: SchemaRegistry,
  _path?: string
): string {
  // Generate schema fragments from registered schemas
  const schemas = registry.getAll()
  const fragments: string[] = []

  for (const schema of schemas) {
    fragments.push(`// Model: ${schema.name}`)
    fragments.push(`model ${schema.name} {`)

    const fields = normalizeFields(safeParseJson(schema.fields))
    const fieldNames = new Set(fields.map(field => field.name))

    if (!fieldNames.has('id')) {
      fragments.push('  id String @id @default(cuid())')
    }
    if (!fieldNames.has('createdAt')) {
      fragments.push('  createdAt DateTime @default(now())')
    }
    if (!fieldNames.has('updatedAt')) {
      fragments.push('  updatedAt DateTime @updatedAt')
    }

    for (const field of fields) {
      const line = renderSchemaField(field)
      if (line !== null) fragments.push(`  ${line}`)
    }

    fragments.push('}')
    fragments.push('')
  }

  return fragments.join('\n')
}

export function approveMigration(
  _migrationId: string,
  _registry: SchemaRegistry
): boolean {
  const entry = findMigration(_registry, _migrationId)
  if (entry === null) return false

  entry.status = 'approved'
  entry.approvedAt = new Date().toISOString()
  return true
}

export function rejectMigration(
  _migrationId: string,
  _registry: SchemaRegistry
): boolean {
  const entry = findMigration(_registry, _migrationId)
  if (entry === null) return false

  entry.status = 'rejected'
  return true
}

type MigrationEntry = {
  id: string
  packageId: string
  status: string
  queuedAt: string
  entities: unknown
  approvedAt?: string
}

function isMigrationEntry(value: unknown): value is MigrationEntry {
  if (value === null || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.packageId === 'string' &&
    typeof record.status === 'string' &&
    typeof record.queuedAt === 'string'
  )
}

function findMigration(
  registry: SchemaRegistry,
  migrationId: string
): MigrationEntry | null {
  const entries = registry.migrationQueue.filter(isMigrationEntry)
  const entry = entries.find(
    item => item.id === migrationId && item.status === 'pending'
  )
  return entry ?? null
}

function coerceEntities(value: unknown): Array<{ name: string }> {
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

function normalizeSchema(raw: JsonRecord): ModelSchema | null {
  const name =
    typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : null
  if (name === null) return null

  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : name
  const schema: ModelSchema = {
    id,
    name,
    fields: normalizeJsonValue(raw.fields, '[]'),
  }

  const tenantId = pickNullableString(raw.tenantId)
  if (tenantId !== undefined) schema.tenantId = tenantId

  const label = pickNullableString(raw.label)
  if (label !== undefined) schema.label = label

  const labelPlural = pickNullableString(raw.labelPlural)
  if (labelPlural !== undefined) schema.labelPlural = labelPlural

  const icon = pickNullableString(raw.icon)
  if (icon !== undefined) schema.icon = icon

  const listDisplay = normalizeOptionalJsonValue(raw.listDisplay)
  if (listDisplay !== undefined) schema.listDisplay = listDisplay

  const listFilter = normalizeOptionalJsonValue(raw.listFilter)
  if (listFilter !== undefined) schema.listFilter = listFilter

  const searchFields = normalizeOptionalJsonValue(raw.searchFields)
  if (searchFields !== undefined) schema.searchFields = searchFields

  const ordering = normalizeOptionalJsonValue(raw.ordering)
  if (ordering !== undefined) schema.ordering = ordering

  const validations = normalizeOptionalJsonValue(raw.validations)
  if (validations !== undefined) schema.validations = validations

  const hooks = normalizeOptionalJsonValue(raw.hooks)
  if (hooks !== undefined) schema.hooks = hooks

  return schema
}

function pickNullableString(value: unknown): string | null | undefined {
  if (typeof value === 'string') return value
  if (value === null) return null
  return undefined
}

function normalizeJsonValue(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return fallback
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

function normalizeOptionalJsonValue(value: unknown): string | null | undefined {
  if (value === null) return null
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function normalizeFields(raw: unknown): FieldSpec[] {
  if (Array.isArray(raw)) {
    return raw.filter(isFieldSpec).map(field => ({ ...field }))
  }

  if (raw !== null && typeof raw === 'object') {
    const record = raw as JsonRecord
    const nested = record.fields

    if (Array.isArray(nested)) {
      return nested.filter(isFieldSpec).map(field => ({ ...field }))
    }

    if (
      nested !== null &&
      typeof nested === 'object' &&
      !Array.isArray(nested)
    ) {
      return Object.entries(nested as JsonRecord)
        .map(([name, value]) => toFieldSpec(name, value))
        .filter((field): field is FieldSpec => field !== null)
    }

    return Object.entries(record)
      .map(([name, value]) => toFieldSpec(name, value))
      .filter((field): field is FieldSpec => field !== null)
  }

  return []
}

function isFieldSpec(value: unknown): value is FieldSpec {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as FieldSpec).name === 'string'
  )
}

function toFieldSpec(name: string, value: unknown): FieldSpec | null {
  if (value === null || value === undefined) return null
  if (typeof name !== 'string' || name.length === 0) return null

  if (typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as JsonRecord), name } as FieldSpec
  }

  return { name, type: typeof value === 'string' ? value : undefined }
}

function buildEntitiesIndex(schemas: ModelSchema[]): Record<string, unknown> {
  const entities: Record<string, unknown> = {}

  for (const schema of schemas) {
    const fields = safeParseJson(schema.fields)
    entities[schema.name] = {
      fields: fields ?? [],
    }
  }

  return entities
}
