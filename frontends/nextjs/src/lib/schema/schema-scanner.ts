/**
 * Package Schema Scanner
 * 
 * Scans all packages for schema definitions and queues changes.
 */

import * as fs from 'fs'
import * as path from 'path'

import {
  validateAndQueueSchema,
  type SchemaRegistry,
} from './schema-registry'

const PACKAGES_PATH = path.join(process.cwd(), '..', '..', '..', 'packages')

export interface ScanResult {
  scanned: number
  queued: number
  errors: string[]
}

/**
 * Scan all packages for schema definitions
 */
export const scanAllPackages = async (registry: SchemaRegistry): Promise<ScanResult> => {
  const result: ScanResult = {
    scanned: 0,
    queued: 0,
    errors: [],
  }
  
  if (!fs.existsSync(PACKAGES_PATH)) {
    result.errors.push(`Packages directory not found: ${PACKAGES_PATH}`)
    return result
  }
  
  const packages = fs.readdirSync(PACKAGES_PATH)
    .filter(p => {
      const pkgPath = path.join(PACKAGES_PATH, p)
      return fs.statSync(pkgPath).isDirectory()
    })
  
  for (const pkg of packages) {
    const pkgPath = path.join(PACKAGES_PATH, pkg)
    const schemaPath = path.join(pkgPath, 'seed', 'schema', 'entities.yaml')
    
    // Skip packages without schemas
    if (!fs.existsSync(schemaPath)) {
      continue
    }
    
    result.scanned++
    
    try {
      const validateResult = validateAndQueueSchema(pkg, pkgPath, registry)
      
      if (validateResult.migrationId && validateResult.message === 'Queued for migration') {
        result.queued++
      }
    } catch (error) {
      result.errors.push(`${pkg}: ${String(error)}`)
    }
  }
  
  return result
}

/**
 * Scan a specific package for schema changes
 */
export const scanPackage = (
  packageId: string,
  registry: SchemaRegistry
): { success: boolean; message: string; migrationId?: string } => {
  const pkgPath = path.join(PACKAGES_PATH, packageId)
  
  if (!fs.existsSync(pkgPath)) {
    return { success: false, message: `Package not found: ${packageId}` }
  }
  
  return validateAndQueueSchema(packageId, pkgPath, registry)
}
