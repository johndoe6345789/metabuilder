/**
 * Package Schema Registry & Migration Queue (API-side)
 * 
 * Re-exports from tools/codegen/schema-registry for use in API routes.
 * This module provides schema management capabilities via the DBAL API.
 */

import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

// Types
export interface PackageSchemaField {
  type: string
  primary?: boolean
  generated?: boolean
  required?: boolean
  nullable?: boolean
  index?: boolean
  unique?: boolean
  default?: unknown
  maxLength?: number
  enum?: string[]
  description?: string
}

export interface PackageSchemaIndex {
  fields: string[]
  unique?: boolean
  name?: string
}

export interface PackageSchemaRelation {
  kind: 'hasOne' | 'hasMany' | 'belongsTo' | 'manyToMany'
  target: string
  foreignKey?: string
  through?: string
  references?: string
}

export interface PackageSchemaEntity {
  name: string
  fields: Record<string, PackageSchemaField>
  indexes?: PackageSchemaIndex[]
  relations?: Record<string, PackageSchemaRelation>
}

export interface PackageSchema {
  packageId: string
  version: string
  entities: PackageSchemaEntity[]
}

export interface MigrationQueueItem {
  id: string
  packageId: string
  status: 'pending' | 'approved' | 'rejected' | 'applied'
  queuedAt: string
  approvedAt?: string
  appliedAt?: string
  checksum: string
  entities: PackageSchemaEntity[]
  prismaFragment?: string
}

export interface SchemaRegistry {
  version: string
  packages: Record<string, {
    currentChecksum: string
    appliedAt: string
    entities: string[]
  }>
  migrationQueue: MigrationQueueItem[]
}

/**
 * Convert snake_case package name to PascalCase prefix
 */
export const packageToPascalCase = (packageId: string): string => {
  return packageId
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

/**
 * Generate prefixed entity name to avoid package collisions
 */
export const getPrefixedEntityName = (packageId: string, entityName: string): string => {
  const prefix = packageToPascalCase(packageId)
  return `Pkg_${prefix}_${entityName}`
}

/**
 * Load registry from disk
 */
export const loadSchemaRegistry = (registryPath: string): SchemaRegistry => {
  if (!fs.existsSync(registryPath)) {
    return {
      version: '1.0.0',
      packages: {},
      migrationQueue: [],
    }
  }
  
  const content = fs.readFileSync(registryPath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Save registry to disk
 */
export const saveSchemaRegistry = (registry: SchemaRegistry, registryPath: string): void => {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))
}

/**
 * Get pending migrations
 */
export const getPendingMigrations = (registry: SchemaRegistry): MigrationQueueItem[] => {
  return registry.migrationQueue.filter(m => m.status === 'pending')
}

/**
 * Get approved migrations
 */
export const getApprovedMigrations = (registry: SchemaRegistry): MigrationQueueItem[] => {
  return registry.migrationQueue.filter(m => m.status === 'approved')
}

/**
 * Approve a migration
 */
export const approveMigration = (id: string, registry: SchemaRegistry): boolean => {
  const migration = registry.migrationQueue.find(m => m.id === id)
  if (!migration || migration.status !== 'pending') {
    return false
  }
  
  migration.status = 'approved'
  migration.approvedAt = new Date().toISOString()
  return true
}

/**
 * Reject a migration
 */
export const rejectMigration = (id: string, registry: SchemaRegistry): boolean => {
  const migration = registry.migrationQueue.find(m => m.id === id)
  if (!migration || migration.status !== 'pending') {
    return false
  }
  
  migration.status = 'rejected'
  return true
}

/**
 * Compute checksum for schema
 */
export const computeSchemaChecksum = (schema: PackageSchema): string => {
  const normalized = JSON.stringify(schema.entities.sort((a, b) => a.name.localeCompare(b.name)))
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16)
}

/**
 * Load package schema from YAML file
 */
export const loadPackageSchema = (packageId: string, packagePath: string): PackageSchema | null => {
  const schemaPath = path.join(packagePath, 'seed', 'schema', 'entities.yaml')
  
  if (!fs.existsSync(schemaPath)) {
    return null
  }
  
  const content = fs.readFileSync(schemaPath, 'utf-8')
  const parsed = parseYaml(content) as { version?: string; entities?: Record<string, unknown> }
  
  if (!parsed?.entities) {
    return null
  }
  
  const entities: PackageSchemaEntity[] = []
  
  for (const [name, def] of Object.entries(parsed.entities)) {
    const entityDef = def as {
      fields?: Record<string, PackageSchemaField>
      indexes?: PackageSchemaIndex[]
      relations?: Record<string, PackageSchemaRelation>
    }
    
    entities.push({
      name,
      fields: entityDef.fields || {},
      indexes: entityDef.indexes,
      relations: entityDef.relations,
    })
  }
  
  return {
    packageId,
    version: parsed.version || '1.0.0',
    entities,
  }
}

/**
 * Generate Prisma model from entity
 */
export const entityToPrisma = (entity: PackageSchemaEntity, packageId: string): string => {
  const prefixedName = getPrefixedEntityName(packageId, entity.name)
  const tableName = `${packageId}_${entity.name.toLowerCase()}`
  
  const lines: string[] = []
  lines.push(`model ${prefixedName} {`)
  
  // Fields
  for (const [fieldName, field] of Object.entries(entity.fields)) {
    let line = `  ${fieldName} `
    
    // Type mapping
    const typeMap: Record<string, string> = {
      'String': 'String',
      'Int': 'Int',
      'Float': 'Float',
      'Boolean': 'Boolean',
      'DateTime': 'DateTime',
      'Json': 'Json',
      'BigInt': 'BigInt',
      'Decimal': 'Decimal',
      'Bytes': 'Bytes',
    }
    
    line += typeMap[field.type] || 'String'
    
    if (field.nullable) {
      line += '?'
    }
    
    const attrs: string[] = []
    
    if (field.primary) {
      attrs.push('@id')
    }
    
    if (field.generated) {
      attrs.push('@default(cuid())')
    } else if (field.default !== undefined) {
      if (typeof field.default === 'string') {
        if (field.default === 'now()') {
          attrs.push('@default(now())')
        } else {
          attrs.push(`@default("${field.default}")`)
        }
      } else if (typeof field.default === 'boolean') {
        attrs.push(`@default(${field.default})`)
      } else if (typeof field.default === 'number') {
        attrs.push(`@default(${field.default})`)
      }
    }
    
    if (field.unique) {
      attrs.push('@unique')
    }
    
    if (field.index) {
      attrs.push('@index')
    }
    
    if (attrs.length > 0) {
      line += ' ' + attrs.join(' ')
    }
    
    lines.push(line)
  }
  
  // Relations
  if (entity.relations) {
    lines.push('')
    for (const [relName, rel] of Object.entries(entity.relations)) {
      const targetPrefixed = getPrefixedEntityName(packageId, rel.target)
      
      if (rel.kind === 'belongsTo') {
        lines.push(`  ${relName} ${targetPrefixed}? @relation(fields: [${rel.foreignKey}], references: [${rel.references || 'id'}])`)
      } else if (rel.kind === 'hasMany') {
        lines.push(`  ${relName} ${targetPrefixed}[]`)
      } else if (rel.kind === 'hasOne') {
        lines.push(`  ${relName} ${targetPrefixed}?`)
      }
    }
  }
  
  // Table mapping
  lines.push('')
  lines.push(`  @@map("${tableName}")`)
  
  // Indexes
  if (entity.indexes) {
    for (const idx of entity.indexes) {
      const fields = idx.fields.join(', ')
      if (idx.unique) {
        lines.push(`  @@unique([${fields}])`)
      } else {
        lines.push(`  @@index([${fields}])`)
      }
    }
  }
  
  lines.push('}')
  
  return lines.join('\n')
}

/**
 * Generate full Prisma fragment for approved migrations
 */
export const generatePrismaFragment = (registry: SchemaRegistry): string => {
  const approved = getApprovedMigrations(registry)
  
  if (approved.length === 0) {
    return ''
  }
  
  const fragments: string[] = [
    '// Auto-generated from package schemas',
    '// DO NOT EDIT MANUALLY',
    `// Generated at: ${new Date().toISOString()}`,
    '',
  ]
  
  for (const migration of approved) {
    fragments.push(`// Package: ${migration.packageId}`)
    
    for (const entity of migration.entities) {
      fragments.push(entityToPrisma(entity, migration.packageId))
      fragments.push('')
    }
  }
  
  return fragments.join('\n')
}

/**
 * Validate and queue schema changes
 */
export const validateAndQueueSchema = (
  packageId: string,
  packagePath: string,
  registry: SchemaRegistry
): { success: boolean; message: string; migrationId?: string } => {
  const schema = loadPackageSchema(packageId, packagePath)
  
  if (!schema) {
    return { success: false, message: 'No schema found' }
  }
  
  const checksum = computeSchemaChecksum(schema)
  const currentPkg = registry.packages[packageId]
  
  // Check if schema has changed
  if (currentPkg && currentPkg.currentChecksum === checksum) {
    return { success: true, message: 'Schema unchanged' }
  }
  
  // Check if already queued
  const existingPending = registry.migrationQueue.find(
    m => m.packageId === packageId && m.checksum === checksum && m.status === 'pending'
  )
  
  if (existingPending) {
    return { success: true, message: 'Already queued', migrationId: existingPending.id }
  }
  
  // Queue new migration
  const migrationId = `${packageId}-${Date.now()}`
  
  registry.migrationQueue.push({
    id: migrationId,
    packageId,
    status: 'pending',
    queuedAt: new Date().toISOString(),
    checksum,
    entities: schema.entities,
  })
  
  return { success: true, message: 'Queued for migration', migrationId }
}

/**
 * Check if container restart is needed
 */
export const needsContainerRestart = (registry: SchemaRegistry): boolean => {
  return getApprovedMigrations(registry).length > 0
}
