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
  /** Minimum permission level required (1=Public, 2=User, 3=Moderator, 4=Admin, 5=God, 6=Supergod) */
  minLevel: number
  /** Package dependencies that must be loaded first */
  dependencies: string[]
  /** Icon path relative to package root */
  icon?: string
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
