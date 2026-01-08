import type { JsonObject, JsonValue } from '@/types/utility-types'

export interface ScriptFile {
  name: string
  path: string
  code: string
  category?: string
  description?: string
}

export type PackageComponent = {
  id: string
  [key: string]: JsonValue
}

export type PackageExamples = JsonObject

export interface PackageDefinition {
  packageId: string
  name: string
  version: string
  description: string
  author: string
  category: string
  dependencies: string[]
  /** Minimum permission level required to access this package (1=Public, 2=User, 3=Admin, 4=God, 5=Supergod) */
  minLevel: number
  exports: {
    components: string[]
    scripts?: string[]
    states?: string[]
    handlers?: string[]
  }
  shadowcnComponents?: string[]
  components: PackageComponent[]
  scripts?: string
  scriptFiles?: ScriptFile[]
  examples?: PackageExamples
}

export interface PackageRegistry {
  [packageId: string]: PackageDefinition
}
