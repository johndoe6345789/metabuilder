import type { PackageDefinition, PackageExamples } from '../types'

export function getPackageExamples(pkg: PackageDefinition): PackageExamples {
  return pkg.examples ?? {}
}
