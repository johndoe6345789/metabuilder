import type { PackageDefinition } from './types'

// Get package scripts (Lua code)
export function getPackageScripts(pkg: PackageDefinition): string {
  return pkg.scripts || ''
}
