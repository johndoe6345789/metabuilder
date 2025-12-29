import type { JsonObject, JsonValue } from '@/types/utility-types'

export interface LuaScriptFile {
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
  exports: {
    components: string[]
    scripts?: string[]
    states?: string[]
    handlers?: string[]
  }
  shadowcnComponents?: string[]
  components: PackageComponent[]
  scripts?: string
  scriptFiles?: LuaScriptFile[]
  examples?: PackageExamples
}

export interface PackageRegistry {
  [packageId: string]: PackageDefinition
}
