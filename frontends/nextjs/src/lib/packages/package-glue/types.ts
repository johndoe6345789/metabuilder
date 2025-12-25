export interface LuaScriptFile {
  name: string
  path: string
  code: string
  category?: string
  description?: string
}

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
  components: any[]
  scripts?: string
  scriptFiles?: LuaScriptFile[]
  examples?: any
}

export interface PackageRegistry {
  [packageId: string]: PackageDefinition
}
