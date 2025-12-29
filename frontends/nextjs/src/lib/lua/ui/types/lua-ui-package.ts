/**
 * TypeScript types for Lua UI packages
 * These types define the structure of UI packages written in Lua
 */

export interface LuaUIMetadata {
  id: string
  version: string
  name: string
  description: string
  author?: string
  category: 'ui' | 'action' | 'validation' | 'workflow'
  dependencies?: string[]
}

export interface LuaUIPage {
  id: string
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
  handler: string | Function
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
    custom?: string | Function
  }
}

export interface LuaUIPackage {
  metadata: LuaUIMetadata
  pages: LuaUIPage[]
  actions?: Record<string, Function>
  validation?: LuaUIValidation
  hooks?: {
    onMount?: Function
    onUnmount?: Function
    beforeRender?: Function
  }
}
