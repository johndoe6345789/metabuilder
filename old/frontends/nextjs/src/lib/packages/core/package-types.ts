import type { JsonObject, JsonValue } from '@/types/utility-types'

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
  schemas: JsonValue[]
  pages: JsonValue[]
  workflows: JsonValue[]
  componentHierarchy: JsonObject
  componentConfigs: JsonObject
  cssClasses?: JsonValue[]
  dropdownConfigs?: JsonValue[]
  seedData?: PackageSeedData
}

export type PackageSeedRecord = JsonObject

export type PackageSeedData = Record<string, PackageSeedRecord[]>

export interface ScriptFile {
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
