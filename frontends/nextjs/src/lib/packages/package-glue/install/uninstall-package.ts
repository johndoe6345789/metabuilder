import { getPackage } from './get-package'
import { getPackageComponents } from './get-package-components'
import type { PackageRegistry } from './types'

// Uninstall package
export async function uninstallPackage(
  registry: PackageRegistry,
  packageId: string,
  db: any
): Promise<{ success: boolean; error?: string }> {
  const pkg = getPackage(registry, packageId)

  if (!pkg) {
    return { success: false, error: `Package ${packageId} not found` }
  }

  try {
    // Remove components
    const components = getPackageComponents(pkg)
    for (const component of components) {
      await db.delete('components', component.id)
    }

    // Remove scripts
    await db.delete('lua_scripts', `package_${pkg.packageId}`)

    // Remove from installed packages
    await db.delete('installed_packages', packageId)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Uninstallation failed: ${error}`,
    }
  }
}
