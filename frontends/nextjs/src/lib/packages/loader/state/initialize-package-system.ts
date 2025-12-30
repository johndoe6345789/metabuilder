import { PACKAGE_CATALOG } from '../../../package-lib/package-catalog'
import { loadPackageComponents } from '../../../rendering/declarative-component-renderer'
import {
  buildPackageRegistry,
  exportAllPackagesForSeed,
  resolveDependencyOrder,
} from '../../package-glue'
import { setPackageRegistry } from '../registry/set-package-registry'
import { packageSystemState } from './package-system-state'

/**
 * Initializes the package system by loading all available packages
 * This function is idempotent - calling multiple times is safe
 */
export async function initializePackageSystem(): Promise<void> {
  if (packageSystemState.isInitialized) return

  // Load modular packages from /packages folder structure
  try {
    const packageRegistry = await buildPackageRegistry()
    
    // Resolve dependencies and get load order
    const dependencyResult = resolveDependencyOrder(packageRegistry)
    
    if (dependencyResult.unresolvable.length > 0) {
      console.warn('⚠️ Packages with missing dependencies:', dependencyResult.unresolvable)
    }
    
    if (dependencyResult.circular.length > 0) {
      console.warn('⚠️ Circular dependencies detected:', dependencyResult.circular)
    }

    setPackageRegistry(packageRegistry)

    const seedData = exportAllPackagesForSeed(packageRegistry)
    packageSystemState.modularPackageSeedData = seedData

    console.log('Loaded modular package data:', {
      components: seedData.components?.length || 0,
      scripts: seedData.scripts?.length || 0,
      packages: seedData.packages?.length || 0,
    })

    console.log(
      `✅ Loaded ${seedData.packages.length} modular packages in dependency order:`,
      dependencyResult.loadOrder.join(' → ')
    )
  } catch (error) {
    console.warn('⚠️ Could not load modular packages:', error)
  }

  // Load legacy packages from catalog for backward compatibility
  Object.values(PACKAGE_CATALOG).forEach(pkg => {
    const packageData = pkg()

    if (packageData.content) {
      loadPackageComponents(packageData.content)
    }
  })

  packageSystemState.isInitialized = true
}
