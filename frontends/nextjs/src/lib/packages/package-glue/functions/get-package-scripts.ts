import type { PackageDefinition } from '../types'

export function getPackageScripts(pkg: PackageDefinition) {
  return pkg.scripts ?? ''
}
