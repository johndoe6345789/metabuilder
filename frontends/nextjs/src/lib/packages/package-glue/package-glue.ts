import { buildPackageRegistry } from './scripts/build-package-registry'
import { checkDependencies } from './scripts/check-dependencies'
import { exportAllPackagesForSeed } from './scripts/export-all-packages-for-seed'
import { getAllPackageScripts } from './scripts/get-all-package-scripts'
import { getInstalledPackages } from './scripts/get-installed-packages'
import { getPackage } from './scripts/get-package'
import { getPackageComponents } from './scripts/get-package-components'
import { getPackageExamples } from './scripts/get-package-examples'
import { getPackageScriptFiles } from './scripts/get-package-script-files'
import { getPackageScripts } from './scripts/get-package-scripts'
import { getPackagesByCategory } from './scripts/get-packages-by-category'
import { installPackage } from './scripts/install-package'
import { installPackageComponents } from './scripts/install-package-components'
import { installPackageScripts } from './scripts/install-package-scripts'
import { isPackageInstalled } from './scripts/is-package-installed'
import { uninstallPackage } from './scripts/uninstall-package'

/**
 * PackageGlue - Wrapper class for package registry helpers
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
export const getPackageGlue = (): PackageGlue => packageGlue
