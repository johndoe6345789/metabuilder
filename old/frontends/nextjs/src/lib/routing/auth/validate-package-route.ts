/**
 * Validate package route
 */

import { promises as fs, readFileSync } from 'fs'
import path from 'path'

export interface RouteValidationResult {
  allowed: boolean
  error?: string
  reason?: string
  package?: {
    name?: string
    minLevel?: number
  }
}

/**
 * Validate packageId to prevent path traversal attacks.
 * Returns true if the packageId is safe to use in file paths.
 */
function isValidPackageId(packageId: string): boolean {
  // Must match pattern: starts with letter, contains only lowercase letters, numbers, underscores
  if (!/^[a-z][a-z0-9_]*$/.test(packageId)) {
    return false
  }
  // Extra safety: reject any path-like characters
  if (packageId.includes('..') || packageId.includes('/') || packageId.includes('\\')) {
    return false
  }
  // Length limit to prevent buffer issues
  if (packageId.length > 64) {
    return false
  }
  return true
}

export function validatePackageRoute(
  packageId: string,
  entity: string,
  _user?: unknown
): RouteValidationResult {
  // Validate packageId before any file operations
  if (!isValidPackageId(packageId)) {
    return { allowed: false, error: 'Invalid package ID format', reason: 'Invalid package ID' }
  }
  
  const metadata = loadPackageMetadataSync(packageId)

  if (metadata === null) {
    // Custom REST is optional; allow standard routes by default.
    return { allowed: true }
  }

  const packageName = typeof metadata.name === 'string' ? metadata.name : undefined
  const minLevel = typeof metadata.minLevel === 'number' ? metadata.minLevel : undefined
  const entities = normalizeSchemaEntities(metadata.schema)

  if (entities.length > 0 && !entities.includes(entity)) {
    return {
      allowed: false,
      reason: `Entity not declared in package schema: ${entity}`,
      package: {
        name: packageName,
        minLevel,
      },
    }
  }

  return {
    allowed: true,
    package: {
      name: packageName,
      minLevel,
    },
  }
}

export function canBePrimaryPackage(_packageId: string): boolean {
  const metadata = loadPackageMetadataSync(_packageId)
  if (metadata === null) return true
  if (typeof metadata.primary === 'boolean') return metadata.primary
  return true
}

export async function loadPackageMetadata(packageId: string): Promise<unknown> {
  const resolved = await readPackageJson(packageId)
  if (resolved !== null) return resolved
  return await readSeedMetadata(packageId)
}

type PackageMetadata = {
  name?: unknown
  minLevel?: unknown
  primary?: unknown
  schema?: unknown
}

function loadPackageMetadataSync(packageId: string): PackageMetadata | null {
  const resolved = readJsonSync(getPackageJsonPath(packageId))
  if (resolved !== null) return resolved as PackageMetadata
  const fallback = readJsonSync(getSeedMetadataPath(packageId))
  return fallback as PackageMetadata | null
}

function normalizeSchemaEntities(schema: unknown): string[] {
  if (schema === null || typeof schema !== 'object') return []
  const record = schema as Record<string, unknown>
  const entities = record.entities
  if (!Array.isArray(entities)) return []
  return entities.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
}

function getPackageJsonPath(packageId: string): string {
  // Path is safe because packageId is validated by isValidPackageId before use
  const packagesBase = path.resolve(process.cwd(), 'packages')
  const resolved = path.resolve(packagesBase, packageId, 'package.json')
  // Double-check the resolved path is within packages directory
  if (!resolved.startsWith(packagesBase + path.sep)) {
    throw new Error('Invalid package path')
  }
  return resolved
}

function getSeedMetadataPath(packageId: string): string {
  // Path is safe because packageId is validated by isValidPackageId before use
  const packagesBase = path.resolve(process.cwd(), 'packages')
  const resolved = path.resolve(packagesBase, packageId, 'seed', 'metadata.json')
  // Double-check the resolved path is within packages directory
  if (!resolved.startsWith(packagesBase + path.sep)) {
    throw new Error('Invalid package path')
  }
  return resolved
}

async function readPackageJson(packageId: string): Promise<unknown> {
  return readJsonAsync(getPackageJsonPath(packageId))
}

async function readSeedMetadata(packageId: string): Promise<unknown> {
  return readJsonAsync(getSeedMetadataPath(packageId))
}

async function readJsonAsync(filePath: string): Promise<unknown> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function readJsonSync(filePath: string): unknown {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}
