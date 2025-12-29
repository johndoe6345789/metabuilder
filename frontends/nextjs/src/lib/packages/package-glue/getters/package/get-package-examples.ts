import type { PackageDefinition, PackageExamples } from './types'

// Get package examples
export function getPackageExamples(pkg: PackageDefinition): PackageExamples {
  return pkg.examples || {}
}
