/**
 * Package type definitions
 */
export interface PackageMetadata {
  name: string
  version: string
  description?: string
  dependencies?: string[]
  exports?: Record<string, any>
}

export interface InstalledPackage {
  id: string
  packageId: string
  version: string
  installedAt: number
  enabled?: boolean
}
