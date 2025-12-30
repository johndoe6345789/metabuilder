import { checkDependencies } from './check-dependencies'
import { getPackage } from './get-package'
import { installPackageComponents } from './install-package-components'
import { installPackageScripts } from './install-package-scripts'
import type { PackageRegistry } from './types'

type InstalledPackageRecord = {
  packageId: string
  name: string
  version: string
  installedAt: number
}

type PackageInstallStore = {
  set(table: 'installed_packages', id: string, value: InstalledPackageRecord): Promise<void>
  set(table: 'components', id: string, value: { id: string }): Promise<void>
  set(table: 'lua_scripts', id: string, value: { id: string }): Promise<void>
}

// Install entire package
export async function installPackage(
  registry: PackageRegistry,
  packageId: string,
  db: PackageInstallStore
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
