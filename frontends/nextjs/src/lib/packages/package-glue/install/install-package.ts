import { checkDependencies } from './check-dependencies'
import { getPackage } from './get-package'
import { installPackageComponents } from './install-package-components'
import { installPackageScripts } from './install-package-scripts'
import type { PackageRegistry } from './types'

// Install entire package
export async function installPackage(
  registry: PackageRegistry,
  packageId: string,
  db: any
): Promise<{ success: boolean; error?: string }> {
  const pkg = getPackage(registry, packageId)

  if (!pkg) {
    return { success: false, error: `Package ${packageId} not found` }
  }

  // Check dependencies
  const depCheck = checkDependencies(registry, packageId)
  if (!depCheck.satisfied) {
    return {
      success: false,
      error: `Missing dependencies: ${depCheck.missing.join(', ')}`,
    }
  }

  try {
    // Install components
    await installPackageComponents(pkg, db)

    // Install scripts
    await installPackageScripts(pkg, db)

    // Mark package as installed
    await db.set('installed_packages', packageId, {
      packageId,
      name: pkg.name,
      version: pkg.version,
      installedAt: Date.now(),
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Installation failed: ${error}`,
    }
  }
}
