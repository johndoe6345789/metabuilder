/**
 * Lua UI Component Types
 * Mirrors the structure produced by Lua render functions
 */

export interface LuaUIComponent {
  type: string
  props?: Record<string, unknown>
  children?: LuaUIComponent[]
}

export interface LuaPackageMetadata {
  packageId: string
  name: string
  version: string
  description: string
  icon?: string
  author?: string
  category: string
  dependencies?: string[]
  exports?: {
    components?: string[]
    scripts?: string[]
    pages?: string[]
  }
  minLevel: number
}

export interface LuaScriptManifest {
  file: string
  name: string
  category?: string
  description?: string
}

export interface LuaPackageScriptsManifest {
  scripts: LuaScriptManifest[]
}

/**
 * Context passed to Lua render functions
 */
export interface LuaRenderContext {
  user?: {
    id?: string
    username: string
    level?: number
    email?: string
  }
  nerdMode?: boolean
  theme?: 'light' | 'dark'
  [key: string]: unknown
}
