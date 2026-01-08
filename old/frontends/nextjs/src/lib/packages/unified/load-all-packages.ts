import { PACKAGE_CATALOG } from '../core/package-catalog'
import { loadAllJSONPackages } from '../json'
import { getPackagesDir } from './get-packages-dir'
import type { UnifiedPackage } from './types'

export async function loadAllPackages(): Promise<UnifiedPackage[]> {
  const packages: UnifiedPackage[] = []
  const seenIds = new Set<string>()

  try {
    const jsonPackages = await loadAllJSONPackages(getPackagesDir())
    for (const jsonPkg of jsonPackages) {
      const id = jsonPkg.metadata.packageId
      if (!seenIds.has(id)) {
        seenIds.add(id)
        packages.push({
          packageId: id,
          name: jsonPkg.metadata.name,
          version: jsonPkg.metadata.version,
          description: jsonPkg.metadata.description,
          category: jsonPkg.metadata.category,
          minLevel: jsonPkg.metadata.minLevel,
          source: 'json',
          jsonData: jsonPkg,
        })
      }
    }
  } catch {
    // Failed to load JSON packages
  }

  for (const [packageId, entry] of Object.entries(PACKAGE_CATALOG)) {
    if (!seenIds.has(packageId)) {
      seenIds.add(packageId)
      const data = entry()
      packages.push({
        packageId: data.manifest.id,
        name: data.manifest.name,
        version: data.manifest.version,
        description: data.manifest.description,
        category: data.manifest.category,
        minLevel: 1,
        source: 'legacy',
        legacyData: data,
      })
    }
  }

  return packages
}
