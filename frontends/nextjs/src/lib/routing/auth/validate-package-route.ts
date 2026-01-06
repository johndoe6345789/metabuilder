/**
 * Validate package route
 */

import { promises as fs } from 'fs'
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

export function validatePackageRoute(
  _package: string,
  _entity: string,
  _userId?: unknown
): RouteValidationResult {
  // TODO: Implement route validation with proper permission checks
  return { allowed: true }
}

export function canBePrimaryPackage(_packageId: string): boolean {
  // TODO: Implement primary package check with validation
  return true
}

export async function loadPackageMetadata(packageId: string): Promise<unknown> {
  try {
    const metadataPath = path.join(process.cwd(), 'packages', packageId, 'seed', 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    return JSON.parse(metadataContent)
  } catch {
    return null
  }
}
  return null
}
