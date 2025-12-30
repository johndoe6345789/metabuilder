import { getPackageComponents } from './get-package-components'
import { getPackageScriptFiles } from './get-package-script-files'
import { getPackageScripts } from './get-package-scripts'
import type { PackageRegistry } from './types'
import type { ModularPackageSeedData } from '../../loader/modular/modular-package-seed-data'

// Export all packages for seeding
export function exportAllPackagesForSeed(registry: PackageRegistry) {
  const seedData: ModularPackageSeedData = {
    components: [],
    scripts: [],
    packages: [],
  }

  for (const [packageId, pkg] of Object.entries(registry)) {
    // Add components
    seedData.components.push(...getPackageComponents(pkg))

    // Add legacy single script
    const legacyScripts = getPackageScripts(pkg)
    if (legacyScripts) {
      seedData.scripts.push({
        id: `package_${packageId}`,
        name: `${pkg.name} Scripts`,
        code: legacyScripts,
        category: 'package',
        packageId,
      })
    }

    // Add multi-file scripts
    const scriptFiles = getPackageScriptFiles(pkg)
    for (const scriptFile of scriptFiles) {
      seedData.scripts.push({
        id: `package_${packageId}_${scriptFile.name}`,
        name: `${pkg.name} - ${scriptFile.name}`,
        code: scriptFile.code,
        category: scriptFile.category || 'package',
        packageId,
        path: scriptFile.path,
        description: scriptFile.description,
      })
    }

    // Add package metadata
    seedData.packages.push({
      packageId,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      category: pkg.category,
      minLevel: pkg.minLevel ?? 1,
      dependencies: pkg.dependencies ?? [],
      icon: 'static_content/icon.svg',
    })
  }

  return seedData
}
