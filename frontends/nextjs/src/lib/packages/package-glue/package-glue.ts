import { buildPackageRegistry } from './build-package-registry'
import { checkDependencies } from './check-dependencies'
import { exportAllPackagesForSeed } from './export-all-packages-for-seed'
import { getAllPackageScripts } from './get-all-package-scripts'
import { getInstalledPackages } from './get-installed-packages'
import { getPackage } from './get-package'
import { getPackageComponents } from './get-package-components'
import { getPackageExamples } from './get-package-examples'
import { getPackageScriptFiles } from './get-package-script-files'
import { getPackageScripts } from './get-package-scripts'
import { getPackagesByCategory } from './get-packages-by-category'
import { installPackage } from './install-package'
import { installPackageComponents } from './install-package-components'
import { installPackageScripts } from './install-package-scripts'
import { isPackageInstalled } from './is-package-installed'
import { uninstallPackage } from './uninstall-package'

/**
 * PackageGlue - Wrapper class for package registry helpers
 *
 * Each method delegates to a single-function module.
 */
export class PackageGlue {
  buildPackageRegistry = buildPackageRegistry
  getPackage = getPackage
  getPackagesByCategory = getPackagesByCategory
  getPackageComponents = getPackageComponents
  getPackageScripts = getPackageScripts
  getPackageScriptFiles = getPackageScriptFiles
  getAllPackageScripts = getAllPackageScripts
  getPackageExamples = getPackageExamples
  checkDependencies = checkDependencies
  installPackageComponents = installPackageComponents
  installPackageScripts = installPackageScripts
  installPackage = installPackage
  uninstallPackage = uninstallPackage
  getInstalledPackages = getInstalledPackages
  isPackageInstalled = isPackageInstalled
  exportAllPackagesForSeed = exportAllPackagesForSeed
}

export const packageGlue = new PackageGlue()
