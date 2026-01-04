/**
 * Package type definitions (core)
 */
export interface PackageMetadata {
  name: string
  version: string
  description?: string
  dependencies?: string[]
  exports?: Record<string, any>
}

export interface PackageData {
  id: string
  data: any
}
