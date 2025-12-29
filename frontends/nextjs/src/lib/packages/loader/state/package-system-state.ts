import type { ModularPackageSeedData } from './modular-package-seed-data'

export const packageSystemState: {
  isInitialized: boolean
  modularPackageSeedData: ModularPackageSeedData | null
} = {
  isInitialized: false,
  modularPackageSeedData: null,
}
