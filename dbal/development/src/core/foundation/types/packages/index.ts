export interface Package {
  id: string
  tenantId: string
  name: string
  version: string
  description?: string
  author: string
  manifest: Record<string, unknown>
  isInstalled: boolean
  installedAt?: Date
  installedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePackageInput {
  tenantId?: string
  name: string
  version: string
  description?: string
  author: string
  manifest: Record<string, unknown>
  isInstalled?: boolean
  installedAt?: Date
  installedBy?: string
}

export interface UpdatePackageInput {
  tenantId?: string
  name?: string
  version?: string
  description?: string
  author?: string
  manifest?: Record<string, unknown>
  isInstalled?: boolean
  installedAt?: Date
  installedBy?: string
}
