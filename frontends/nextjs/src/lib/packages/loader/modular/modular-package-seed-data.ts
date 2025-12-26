/**
 * Type for modular package seed data
 */
export type ModularPackageSeedData = {
  components: any[]
  scripts: any[]
  packages: any[]
}

/**
 * Empty seed data default
 */
export const emptyModularPackageSeedData: ModularPackageSeedData = {
  components: [],
  scripts: [],
  packages: [],
}
