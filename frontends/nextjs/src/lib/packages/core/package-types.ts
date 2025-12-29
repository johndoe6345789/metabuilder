export interface PackageManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  category:
    | 'social'
    | 'entertainment'
    | 'productivity'
    | 'gaming'
    | 'ecommerce'
    | 'content'
    | 'other'
  icon: string
  screenshots: string[]
  tags: string[]
  dependencies: string[]
  createdAt: number
  updatedAt: number
  downloadCount: number
  rating: number
  installed: boolean
}

export interface PackageContent {
  schemas: unknown[]
  pages: unknown[]
  workflows: unknown[]
  luaScripts: unknown[]
  componentHierarchy: Record<string, unknown>
  componentConfigs: Record<string, unknown>
  cssClasses?: unknown[]
  dropdownConfigs?: unknown[]
  seedData?: PackageSeedData
}

export type PackageSeedRecord = Record<string, unknown>

export type PackageSeedData = Record<string, PackageSeedRecord[]>

export interface LuaScriptFile {
  name: string
  path: string
  code: string
  category?: string
  description?: string
}

export interface InstalledPackage {
  packageId: string
  installedAt: number
  version: string
  enabled: boolean
}

export interface PackageRegistry {
  packages: PackageManifest[]
  installed: InstalledPackage[]
}
