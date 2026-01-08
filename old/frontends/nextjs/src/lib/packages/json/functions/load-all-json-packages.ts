import { readdir } from 'fs/promises'
import { join } from 'path'
import type { JSONPackage } from '../types'
import { loadJSONPackage } from './load-json-package'

export async function loadAllJSONPackages(packagesDir: string): Promise<JSONPackage[]> {
  try {
    const packageDirs = await readdir(packagesDir, { withFileTypes: true })
    const packages: JSONPackage[] = []

    for (const dir of packageDirs) {
      if (dir.isDirectory()) {
        try {
          const packagePath = join(packagesDir, dir.name)
          const pkg = await loadJSONPackage(packagePath)
          packages.push(pkg)
        } catch {
          // Failed to load package
        }
      }
    }

    return packages
  } catch {
    return []
  }
}
