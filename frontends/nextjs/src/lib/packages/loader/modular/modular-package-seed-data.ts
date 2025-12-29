import type { PackageComponent } from '../../package-glue/types'

export type ModularPackageScriptSeed = {
  id: string
  name: string
  code: string
  category?: string
  packageId: string
  path?: string
  description?: string
}

export type ModularPackageMetadataSeed = {
  packageId: string
  name: string
  version: string
  description: string
  author: string
  category: string
}

/**
 * Type for modular package seed data
 */
export type ModularPackageSeedData = {
  components: PackageComponent[]
  scripts: ModularPackageScriptSeed[]
  packages: ModularPackageMetadataSeed[]
}

/**
 * Empty seed data default
 */
export const emptyModularPackageSeedData: ModularPackageSeedData = {
  components: [],
  scripts: [],
  packages: [],
}
