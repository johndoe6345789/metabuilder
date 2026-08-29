/** An InstalledPackage row as the packages UI uses it. */

export interface InstalledPackage {
  id: string
  packageId: string
  tenantId: string
  installedAt: number
  version: string
  enabled: boolean
}
