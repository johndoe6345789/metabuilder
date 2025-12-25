import { getPackageScriptFiles } from './get-package-script-files'
import { getPackageScripts } from './get-package-scripts'
import type { PackageDefinition } from './types'

// Install package scripts into database
export async function installPackageScripts(pkg: PackageDefinition, db: any): Promise<void> {
  // Install legacy single script file if it exists
  const legacyScripts = getPackageScripts(pkg)
  if (legacyScripts) {
    await db.set('lua_scripts', `package_${pkg.packageId}`, {
      id: `package_${pkg.packageId}`,
      name: `${pkg.name} Scripts`,
      code: legacyScripts,
      category: 'package',
      packageId: pkg.packageId,
    })
  }

  // Install new multi-file scripts
  const scriptFiles = getPackageScriptFiles(pkg)
  for (const scriptFile of scriptFiles) {
    const scriptId = `package_${pkg.packageId}_${scriptFile.name}`
    await db.set('lua_scripts', scriptId, {
      id: scriptId,
      name: `${pkg.name} - ${scriptFile.name}`,
      code: scriptFile.code,
      category: scriptFile.category || 'package',
      packageId: pkg.packageId,
      path: scriptFile.path,
      description: scriptFile.description,
    })
  }
}
