/**
 * Package Schema Registry & Migration Queue
 * 
 * Flow:
 * 1. Package declares schema in seed/schema/entities.yaml
 * 2. On package install/update, schema is validated & checksummed
 * 3. If schema differs from current DB, added to migration queue
 * 4. Admin reviews queue, approves migrations
 * 5. On container restart, pending migrations are applied
 * 
 * Entity Prefixing:
 * - All entities are prefixed with package name to avoid collisions
 * - Example: forum_forge.Post → Pkg_ForumForge_Post
 * - Prefix format: Pkg_{PascalPackageName}_{EntityName}
 * - Relations automatically use prefixed names
 */

import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Convert snake_case package name to PascalCase prefix
 * Example: forum_forge → ForumForge
 */
export const packageToPascalCase = (packageId: string): string => {
  return packageId
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

/**
 * Generate prefixed entity name to avoid package collisions
 * Format: Pkg_{PascalPackageName}_{EntityName}
 * Example: forum_forge + Post → Pkg_ForumForge_Post
 */
export const getPrefixedEntityName = (packageId: string, entityName: string): string => {
  const prefix = packageToPascalCase(packageId)
  return `Pkg_${prefix}_${entityName}`
}

/**
 * Check if an entity name is prefixed
 */
export const isPrefixedEntityName = (name: string): boolean => {
  return name.startsWith('Pkg_')
}

/**
 * Extract package ID from prefixed entity name
 * Example: Pkg_ForumForge_Post → forum_forge
 */
export const extractPackageFromPrefix = (prefixedName: string): string | null => {
  if (!isPrefixedEntityName(prefixedName)) return null
  const match = prefixedName.match(/^Pkg_([A-Z][a-zA-Z]*)_/)
  if (!match) return null
  // Convert PascalCase back to snake_case
  return match[1].replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * Extract original entity name from prefixed name
 * Example: Pkg_ForumForge_Post → Post
 */
export const extractEntityFromPrefix = (prefixedName: string): string | null => {
  if (!isPrefixedEntityName(prefixedName)) return null
  const parts = prefixedName.split('_')
  if (parts.length < 3) return null
  return parts.slice(2).join('_')
}

// Simple YAML parser for our specific schema format
// Using a lightweight approach to avoid external dependency
const parseYaml = (content: string): unknown => {
  // For complex YAML, we'd use a proper parser
  // This handles our entities.yaml format
  try {
    // Try JSON first (YAML is superset of JSON)
    return JSON.parse(content)
  } catch {
    // Basic YAML parsing for our schema files
    // In production, install 'yaml' package
    const lines = content.split('\n')
    const result: Record<string, unknown> = {}
    let currentKey = ''
    let currentValue: unknown[] = []
    let inArray = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      
      const match = trimmed.match(/^(\w+):\s*(.*)$/)
      if (match) {
        if (currentKey && inArray) {
          result[currentKey] = currentValue
        }
        currentKey = match[1]
        const val = match[2]
        if (val === '' || val === '|' || val === '>') {
          currentValue = []
          inArray = true
        } else {
          result[currentKey] = val
          inArray = false
        }
      } else if (trimmed.startsWith('- ') && inArray) {
        currentValue.push(trimmed.slice(2))
      }
    }
    
    if (currentKey && inArray) {
      result[currentKey] = currentValue
    }
    
    return result
  }
}

const stringifyYaml = (obj: unknown): string => {
  return JSON.stringify(obj, null, 2)
}

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
  name: string
  type: 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany'
  entity: string
  field?: string
  foreignKey?: string
  onDelete?: 'Cascade' | 'SetNull' | 'Restrict' | 'NoAction'
  optional?: boolean
}

export interface PackageSchemaEntity {
  name: string
  version: string
  description?: string
  checksum?: string | null
  fields: Record<string, PackageSchemaField>
  indexes?: PackageSchemaIndex[]
  relations?: PackageSchemaRelation[]
  acl?: Record<string, string[]>
}

export interface PackageSchema {
  entities: PackageSchemaEntity[]
}

export interface MigrationQueueItem {
  id: string
  packageId: string
  entityName: string
  action: 'create' | 'alter' | 'drop'
  currentChecksum: string | null
  newChecksum: string
  schemaYaml: string
  prismaPreview: string
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'failed'
  createdAt: number
  reviewedAt?: number
  reviewedBy?: string
  appliedAt?: number
  error?: string
}

export interface SchemaRegistry {
  entities: Record<string, {
    checksum: string
    version: string
    ownerPackage: string
    prismaModel: string
    appliedAt: number
  }>
  migrationQueue: MigrationQueueItem[]
}

/**
 * Compute deterministic checksum for schema entity
 * Ignores description/comments, only structural fields
 */
export const computeSchemaChecksum = (entity: PackageSchemaEntity): string => {
  const structural = {
    name: entity.name,
    version: entity.version,
    fields: entity.fields,
    indexes: entity.indexes || [],
    relations: entity.relations || [],
  }
  const json = JSON.stringify(structural, Object.keys(structural).sort())
  return crypto.createHash('sha256').update(json).digest('hex').slice(0, 16)
}

/**
 * Convert package schema field to Prisma field definition
 */
export const fieldToPrisma = (name: string, field: PackageSchemaField): string => {
  const parts: string[] = []
  
  // Type mapping
  const typeMap: Record<string, string> = {
    'string': 'String',
    'int': 'Int',
    'bigint': 'BigInt',
    'float': 'Float',
    'boolean': 'Boolean',
    'datetime': 'DateTime',
    'json': 'Json',
    'cuid': 'String',
    'uuid': 'String',
  }
  
  let prismaType = typeMap[field.type] || 'String'
  
  // Nullable
  if (field.nullable) {
    prismaType += '?'
  }
  
  parts.push(`  ${name}`)
  parts.push(prismaType)
  
  // Attributes
  const attrs: string[] = []
  
  if (field.primary) {
    attrs.push('@id')
  }
  
  if (field.generated && field.type === 'cuid') {
    attrs.push('@default(cuid())')
  } else if (field.default !== undefined) {
    if (typeof field.default === 'boolean') {
      attrs.push(`@default(${field.default})`)
    } else if (typeof field.default === 'number') {
      attrs.push(`@default(${field.default})`)
    } else if (typeof field.default === 'string') {
      attrs.push(`@default("${field.default}")`)
    }
  }
  
  if (field.unique) {
    attrs.push('@unique')
  }
  
  if (attrs.length > 0) {
    parts.push(attrs.join(' '))
  }
  
  return parts.join(' ')
}

/**
 * Convert package schema entity to Prisma model
 * Applies package prefix to entity name and relation targets
 */
export const entityToPrisma = (entity: PackageSchemaEntity, packageId?: string): string => {
  const lines: string[] = []
  
  // Use prefixed name if packageId provided
  const modelName = packageId 
    ? getPrefixedEntityName(packageId, entity.name)
    : entity.name
  
  lines.push(`model ${modelName} {`)
  
  // Fields
  for (const [name, field] of Object.entries(entity.fields)) {
    lines.push(fieldToPrisma(name, field))
  }
  
  // Relations - also prefix target entities from same package
  if (entity.relations) {
    lines.push('')
    for (const rel of entity.relations) {
      // Prefix relation target entity if it's from the same package
      const targetEntity = packageId
        ? getPrefixedEntityName(packageId, rel.entity)
        : rel.entity
        
      if (rel.type === 'belongsTo') {
        const optional = rel.optional ? '?' : ''
        lines.push(`  ${rel.name} ${targetEntity}${optional} @relation(fields: [${rel.field}], references: [id]${rel.onDelete ? `, onDelete: ${rel.onDelete}` : ''})`)
      } else if (rel.type === 'hasMany') {
        lines.push(`  ${rel.name} ${targetEntity}[]`)
      }
    }
  }
  
  // Indexes
  if (entity.indexes && entity.indexes.length > 0) {
    lines.push('')
    for (const idx of entity.indexes) {
      const fields = idx.fields.join(', ')
      if (idx.unique) {
        lines.push(`  @@unique([${fields}])`)
      } else {
        lines.push(`  @@index([${fields}])`)
      }
    }
  }
  
  // Map to original table name for cleaner DB
  if (packageId) {
    lines.push('')
    lines.push(`  @@map("${packageId}_${entity.name.toLowerCase()}")`)
  }
  
  lines.push('}')
  
  return lines.join('\n')
}

/**
 * Load schema registry from disk
 */
export const loadSchemaRegistry = (registryPath: string): SchemaRegistry => {
  if (fs.existsSync(registryPath)) {
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
  }
  return { entities: {}, migrationQueue: [] }
}

/**
 * Save schema registry to disk
 */
export const saveSchemaRegistry = (registryPath: string, registry: SchemaRegistry): void => {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))
}

/**
 * Load package schema from seed/schema/entities.yaml
 */
export const loadPackageSchema = (packagePath: string): PackageSchema | null => {
  const schemaPath = path.join(packagePath, 'seed', 'schema', 'entities.yaml')
  if (!fs.existsSync(schemaPath)) {
    return null
  }
  return parseYaml(fs.readFileSync(schemaPath, 'utf-8')) as PackageSchema
}

/**
 * Validate and queue schema changes for a package
 */
export const validateAndQueueSchema = (
  packageId: string,
  packagePath: string,
  registry: SchemaRegistry
): { valid: boolean; errors: string[]; queued: MigrationQueueItem[] } => {
  const errors: string[] = []
  const queued: MigrationQueueItem[] = []
  
  const schema = loadPackageSchema(packagePath)
  if (!schema) {
    return { valid: true, errors: [], queued: [] } // No schema = OK
  }
  
  for (const entity of schema.entities) {
    const newChecksum = computeSchemaChecksum(entity)
    const existing = registry.entities[entity.name]
    
    // Check for conflicts with other packages
    if (existing && existing.ownerPackage !== packageId) {
      if (existing.checksum !== newChecksum) {
        errors.push(
          `Entity "${entity.name}" owned by "${existing.ownerPackage}" has different schema. ` +
          `Current: ${existing.checksum}, Proposed: ${newChecksum}. ` +
          `Packages must use identical schema or coordinate versions.`
        )
        continue
      }
      // Same checksum = compatible, skip
      continue
    }
    
    // New entity or updated schema
    if (!existing || existing.checksum !== newChecksum) {
      const prismaPreview = entityToPrisma(entity)
      const item: MigrationQueueItem = {
        id: crypto.randomUUID(),
        packageId,
        entityName: entity.name,
        action: existing ? 'alter' : 'create',
        currentChecksum: existing?.checksum || null,
        newChecksum,
        schemaYaml: stringifyYaml(entity),
        prismaPreview,
        status: 'pending',
        createdAt: Date.now(),
      }
      queued.push(item)
      registry.migrationQueue.push(item)
    }
  }
  
  return { valid: errors.length === 0, errors, queued }
}

/**
 * Get pending migrations for admin review
 */
export const getPendingMigrations = (registry: SchemaRegistry): MigrationQueueItem[] => {
  return registry.migrationQueue.filter(m => m.status === 'pending')
}

/**
 * Approve a migration (admin action)
 */
export const approveMigration = (
  registry: SchemaRegistry,
  migrationId: string,
  adminUserId: string
): boolean => {
  const migration = registry.migrationQueue.find(m => m.id === migrationId)
  if (!migration || migration.status !== 'pending') {
    return false
  }
  migration.status = 'approved'
  migration.reviewedAt = Date.now()
  migration.reviewedBy = adminUserId
  return true
}

/**
 * Reject a migration (admin action)
 */
export const rejectMigration = (
  registry: SchemaRegistry,
  migrationId: string,
  adminUserId: string
): boolean => {
  const migration = registry.migrationQueue.find(m => m.id === migrationId)
  if (!migration || migration.status !== 'pending') {
    return false
  }
  migration.status = 'rejected'
  migration.reviewedAt = Date.now()
  migration.reviewedBy = adminUserId
  return true
}

/**
 * Generate combined Prisma schema fragment for approved migrations
 */
export const generatePrismaFragment = (registry: SchemaRegistry): string => {
  const approved = registry.migrationQueue.filter(m => m.status === 'approved')
  if (approved.length === 0) {
    return ''
  }
  
  const lines = [
    '// =============================================================================',
    '// AUTO-GENERATED FROM PACKAGE SCHEMAS - DO NOT EDIT MANUALLY',
    '// Generated: ' + new Date().toISOString(),
    '// =============================================================================',
    '',
  ]
  
  for (const migration of approved) {
    lines.push(`// From package: ${migration.packageId}`)
    lines.push(migration.prismaPreview)
    lines.push('')
  }
  
  return lines.join('\n')
}

/**
 * Mark migrations as applied after successful Prisma migrate
 */
export const markMigrationsApplied = (registry: SchemaRegistry): void => {
  const approved = registry.migrationQueue.filter(m => m.status === 'approved')
  for (const migration of approved) {
    migration.status = 'applied'
    migration.appliedAt = Date.now()
    
    // Update registry
    registry.entities[migration.entityName] = {
      checksum: migration.newChecksum,
      version: '1.0', // Could extract from schema
      ownerPackage: migration.packageId,
      prismaModel: migration.prismaPreview,
      appliedAt: Date.now(),
    }
  }
}

/**
 * Check if container restart is needed (approved migrations waiting)
 */
export const needsContainerRestart = (registry: SchemaRegistry): boolean => {
  return registry.migrationQueue.some(m => m.status === 'approved')
}
