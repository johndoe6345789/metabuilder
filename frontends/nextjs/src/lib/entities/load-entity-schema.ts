/**
 * Load entity schema from package
 * 
 * Retrieves the schema definition for an entity from a package's metadata.
 */

import 'server-only'
import { join } from 'path'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { getPackagesDir } from '@/lib/packages/unified/get-packages-dir'

export interface EntityField {
  name: string
  type: string
  required?: boolean
  default?: unknown
  description?: string
  validation?: Record<string, unknown>
}

export interface EntitySchema {
  name: string
  fields: EntityField[]
  primaryKey?: string
  displayName?: string
  description?: string
}

/**
 * Load entity schema from a package
 * 
 * @param packageId - Package identifier
 * @param entityName - Entity name
 * @returns Entity schema or null if not found
 */
export async function loadEntitySchema(
  packageId: string,
  entityName: string
): Promise<EntitySchema | null> {
  try {
    const pkg = await loadJSONPackage(join(getPackagesDir(), packageId))
    
    // Look for entity schema in package metadata
    // This assumes packages have an entities field in their metadata
    // The actual structure may vary based on your package format
    const packageMetadata = pkg.metadata as unknown
    const entities = (packageMetadata as Record<string, unknown>).entities as Record<string, unknown>[] | undefined
    
    if (entities === undefined || !Array.isArray(entities)) {
      return null
    }

    const entity = entities.find(e => e.name === entityName)
    
    if (entity === undefined) {
      return null
    }

    return {
      name: entity.name as string,
      fields: (entity.fields as EntityField[] | undefined) ?? [],
      primaryKey: entity.primaryKey as string | undefined,
      displayName: entity.displayName as string | undefined,
      description: entity.description as string | undefined,
    }
  } catch (error) {
    console.error(`Failed to load entity schema for ${packageId}/${entityName}:`, error)
    return null
  }
}
