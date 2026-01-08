import type { JsonValue } from '@/types/utility-types'

export interface JSONPackageMetadata {
  packageId: string
  name: string
  version: string
  description: string
  author?: string
  license?: string
  category?: string
  icon?: string
  minLevel?: number
  primary?: boolean
  dependencies?: Record<string, string>
  exports?: {
    components?: string[]
    scripts?: string[]
    types?: string[]
  }
  storybook?: {
    featured?: boolean
    excludeFromDiscovery?: boolean
    stories?: JsonValue[]
  }
}

export interface JSONComponent {
  id: string
  name: string
  description?: string
  props?: Array<{
    name: string
    type: string
    required?: boolean
    default?: JsonValue
    description?: string
  }>
  render?: {
    type: string
    template?: JsonValue
  }
}

export interface JSONPermission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  scope?: string
  minLevel?: number
}

export interface JSONPackage {
  metadata: JSONPackageMetadata
  components?: JSONComponent[]
  permissions?: JSONPermission[]
  hasComponents: boolean
  hasPermissions: boolean
  hasStyles: boolean
}
