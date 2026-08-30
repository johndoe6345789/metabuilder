/** The shapes a tenant-scoped route's context is built from. */

export interface PackageInfo {
  id: string
  name?: string
  minLevel?: number
  /** Whether this package can own routes (true) or is dependency-only. */
  primary?: boolean
}

export interface TenantContextValue {
  tenant: string

  /** The package that owns this route. */
  primaryPackage: string

  /** Every package available on this page: primary plus dependencies. */
  packages: PackageInfo[]

  /** Legacy alias for primaryPackage. */
  packageId: string

  getPrefixedEntity: (entity: string) => string
  getTableName: (entity: string) => string

  /** Defaults to the primary package; pass packageId to target another. */
  buildApiUrl: (
    entity: string,
    id?: string,
    action?: string,
    packageId?: string
  ) => string

  hasPackage: (packageId: string) => boolean

  getPrefixedEntityForPackage: (packageId: string, entity: string) => string
}
