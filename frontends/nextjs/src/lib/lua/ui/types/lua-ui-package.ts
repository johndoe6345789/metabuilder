/**
 * TypeScript types for Lua UI packages
 * These types define the structure of UI packages written in Lua
 */

/**
 * Manifest.json structure for Lua UI packages
 */
export interface LuaUIManifest {
  id: string
  version: string
  name: string
  description: string
  author?: string
  category: 'ui' | 'action' | 'validation' | 'workflow'
  dependencies?: string[]
  pages: LuaUIPageManifest[]
  actions?: LuaUIActionManifest[]
}

/**
 * Page reference in manifest.json
 */
export interface LuaUIPageManifest {
  file: string
  path: string
  title: string
  level: number
  requiresAuth?: boolean
  requiredRole?: string
}

/**
 * Action reference in manifest.json
 */
export interface LuaUIActionManifest {
  file: string
  name: string
}

/**
 * Loaded page with rendered component tree
 */
export interface LuaUIPage {
  path: string
  title: string
  level: number
  requiresAuth?: boolean
  requiredRole?: string
  layout: LuaUIComponent
}

export interface LuaUIComponent {
  type: string
  props: Record<string, unknown>
  children?: LuaUIComponent[]
}

export interface LuaUIAction {
  name: string
  handler: string | ((...args: any[]) => any)
}

export interface LuaUIValidation {
  [fieldName: string]: {
    type?: string
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    format?: string
    custom?: string | ((...args: any[]) => any)
  }
}

/**
 * Fully loaded Lua UI package with all files resolved
 */
export interface LuaUIPackage {
  manifest: LuaUIManifest
  pages: LuaUIPage[]
  actions: Record<string, (...args: any[]) => any>
}
