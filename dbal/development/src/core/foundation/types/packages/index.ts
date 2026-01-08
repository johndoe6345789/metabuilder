import type { InstalledPackage as GeneratedInstalledPackage } from '../types.generated'

export type InstalledPackage = GeneratedInstalledPackage

export interface CreatePackageInput {
  [key: string]: unknown
  packageId: string
  tenantId?: string | null
  installedAt?: bigint
  version: string
  enabled: boolean
  config?: string | null
}

export interface UpdatePackageInput {
  [key: string]: unknown
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
  [key: string]: unknown
  packageId: string
  data: string
}

export interface UpdatePackageDataInput {
  [key: string]: unknown
  data?: string
}
