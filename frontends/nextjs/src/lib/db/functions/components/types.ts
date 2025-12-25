/**
 * Component Types
 * Shared types for component hierarchy and config
 */

export interface ComponentNode {
  id: string
  type: string
  parentId?: string
  childIds: string[]
  order: number
  pageId: string
}

export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, any>
  styles: Record<string, any>
  events: Record<string, string>
  conditionalRendering?: {
    condition: string
    luaScriptId?: string
  }
}
