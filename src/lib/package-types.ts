export interface PackageManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: 'social' | 'entertainment' | 'productivity' | 'gaming' | 'ecommerce' | 'content' | 'other'
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
  schemas: any[]
  pages: any[]
  workflows: any[]
  luaScripts: any[]
  componentHierarchy: Record<string, any>
  componentConfigs: Record<string, any>
  cssClasses?: any[]
  dropdownConfigs?: any[]
  seedData?: Record<string, any[]>
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
