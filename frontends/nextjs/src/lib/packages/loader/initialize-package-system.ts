import { PACKAGE_CATALOG } from '../package-catalog'
import { loadPackageComponents } from '../declarative-component-renderer'
import { buildPackageRegistry, exportAllPackagesForSeed } from '../package-glue'
import { setPackageRegistry } from './get-package-registry'
import { emptyModularPackageSeedData, type ModularPackageSeedData } from './modular-package-seed-data'

let isInitialized = false
let modularPackageSeedData: ModularPackageSeedData | null = null

/**
 * Get cached modular package seed data
 */
export function getModularSeedData(): ModularPackageSeedData {
  return modularPackageSeedData ?? emptyModularPackageSeedData
}

/**
 * Initializes the package system by loading all available packages
 * This function is idempotent - calling multiple times is safe
 */
export async function initializePackageSystem(): Promise<void> {
  if (isInitialized) return

  // Load modular packages from /packages folder structure
  try {
    const packageRegistry = await buildPackageRegistry()
    setPackageRegistry(packageRegistry)

    const seedData = exportAllPackagesForSeed(packageRegistry)
    modularPackageSeedData = seedData

    console.log('Loaded modular package data:', {
      components: seedData.components?.length || 0,
      scripts: seedData.scripts?.length || 0,
      packages: seedData.packages?.length || 0,
    })

    console.log(
      `✅ Loaded ${seedData.packages.length} modular packages:`,
      seedData.packages.map((p) => p.name).join(', ')
    )
  } catch (error) {
    console.warn('⚠️ Could not load modular packages:', error)
  }

  // Load legacy packages from catalog for backward compatibility
  Object.values(PACKAGE_CATALOG).forEach((pkg) => {
    if (pkg.content) {
      loadPackageComponents(pkg.content)
    }
  })

  isInitialized = true
}
