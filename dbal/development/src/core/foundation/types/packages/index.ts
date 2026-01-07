import type { InstalledPackage as GeneratedInstalledPackage } from '../types.generated'

export type InstalledPackage = GeneratedInstalledPackage

export interface CreatePackageInput {
  packageId: string
  tenantId?: string | null
  installedAt?: bigint
  version: string
  enabled: boolean
  config?: string | null
}

export interface UpdatePackageInput {
  tenantId?: string | null
  installedAt?: bigint
  version?: string
  enabled?: boolean
  config?: string | null
}

export interface PackageData {
  packageId: string
  data: string
}

export interface CreatePackageDataInput {
  packageId: string
  data: string
}

export interface UpdatePackageDataInput {
  data?: string
}
