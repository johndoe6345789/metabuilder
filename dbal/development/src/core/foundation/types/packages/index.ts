export interface Package {
  id: string
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
  name?: string
  version?: string
  description?: string
  author?: string
  manifest?: Record<string, unknown>
  isInstalled?: boolean
  installedAt?: Date
  installedBy?: string
}
