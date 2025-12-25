import type { PackageDefinition } from './types'

// Get package examples
export function getPackageExamples(pkg: PackageDefinition): any {
  return pkg.examples || {}
}
