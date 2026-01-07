import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'

import type { ModelSchema } from '../types/schema-types'
import type { SchemaRegistry } from './schema-registry'

export interface SchemaScanResult {
  scanned: number
  queued: number
  errors: string[]
}

type PackageMetadata = {
  packageId?: unknown
  name?: unknown
  version?: unknown
  schema?: {
    entities?: unknown
    path?: unknown
  } | null
}

export function scanAllPackages(registry: SchemaRegistry, packagesPath?: string): SchemaScanResult {
  const result: SchemaScanResult = { scanned: 0, queued: 0, errors: [] }
  const resolvedPackagesPath = packagesPath ?? resolvePackagesPath()

  if (!existsSync(resolvedPackagesPath)) {
    result.errors.push(`Packages directory not found: ${resolvedPackagesPath}`)
    return result
  }

  const entries = readdirSync(resolvedPackagesPath, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const packageDir = join(resolvedPackagesPath, entry.name)
    const packageJsonPath = join(packageDir, 'package.json')
    if (!existsSync(packageJsonPath)) continue

    let metadata: PackageMetadata
    try {
      metadata = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageMetadata
    } catch (error) {
      result.errors.push(`Failed to parse ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }

    const packageId = typeof metadata.packageId === 'string' && metadata.packageId.length > 0
      ? metadata.packageId
      : entry.name
    const schemaConfig = metadata.schema

    if (schemaConfig === undefined || schemaConfig === null || typeof schemaConfig !== 'object') {
      continue
    }

    const rawEntities = schemaConfig.entities
    if (!Array.isArray(rawEntities)) {
      result.errors.push(`Schema entities missing or invalid for package ${packageId}`)
      continue
    }

    result.scanned += 1

    const entities = rawEntities.filter((entity): entity is string => typeof entity === 'string' && entity.length > 0)
    const invalidEntities = rawEntities.filter(entity => typeof entity !== 'string')
    if (invalidEntities.length > 0) {
      result.errors.push(`Invalid entity names in package ${packageId}`)
    }

    registry.packages[packageId] = {
      packageId,
      name: typeof metadata.name === 'string' ? metadata.name : packageId,
      version: typeof metadata.version === 'string' ? metadata.version : undefined,
      schema: {
        entities,
        path: typeof schemaConfig.path === 'string' ? schemaConfig.path : null,
      },
    }

    for (const entity of entities) {
      const schemaId = `${packageId}:${entity}`
      const schema: ModelSchema = {
        id: schemaId,
        name: entity,
        fields: '[]',
      }

      if (!registry.has(schemaId)) {
        result.queued += 1
      }
      registry.register(schema)
    }
  }

  return result
}

function resolvePackagesPath(): string {
  const candidates = [
    join(process.cwd(), 'packages'),
    join(process.cwd(), '..', '..', '..', 'packages'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return candidates[0] ?? join(process.cwd(), 'packages')
}
