import { join } from 'path'
import { PACKAGE_CATALOG } from '../core/package-catalog'
import { loadJSONPackage } from '../json'
import { getPackagesDir } from './get-packages-dir'
import type { UnifiedPackage } from './types'

export async function loadPackage(packageId: string): Promise<UnifiedPackage | null> {
  try {
    const packagePath = join(getPackagesDir(), packageId)
    const jsonPkg = await loadJSONPackage(packagePath)

    return {
      packageId: jsonPkg.metadata.packageId,
      name: jsonPkg.metadata.name,
      version: jsonPkg.metadata.version,
      description: jsonPkg.metadata.description,
      category: jsonPkg.metadata.category,
      minLevel: jsonPkg.metadata.minLevel,
      source: 'json',
      jsonData: jsonPkg,
    }
  } catch {
    // JSON package not found, try legacy catalog
  }

  const legacyEntry = PACKAGE_CATALOG[packageId]
  if (legacyEntry !== undefined) {
    const data = legacyEntry()
    return {
      packageId: data.manifest.id,
      name: data.manifest.name,
      version: data.manifest.version,
      description: data.manifest.description,
      category: data.manifest.category,
      minLevel: 1,
      source: 'legacy',
      legacyData: data,
    }
  }

  return null
}
