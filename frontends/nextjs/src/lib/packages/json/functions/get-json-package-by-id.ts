import { join } from 'path'
import type { JSONPackage } from '../types'
import { loadJSONPackage } from './load-json-package'

export async function getJSONPackageById(
  packagesDir: string,
  packageId: string
): Promise<JSONPackage | null> {
  try {
    const packagePath = join(packagesDir, packageId)
    return await loadJSONPackage(packagePath)
  } catch {
    return null
  }
}
