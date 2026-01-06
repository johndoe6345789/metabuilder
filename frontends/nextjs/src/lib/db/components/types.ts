export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, unknown>
  styles: Record<string, unknown>
  events?: Record<string, string>
  conditionalRendering?: {
    condition: string
    luaScriptId?: string
  }
}

export interface ComponentNode {
  id: string
  name: string
  type: string
  parentId?: string
  childIds?: string[]
  order?: number
  pageId?: string
}

export interface ComponentHierarchy {
  id: string
  parentId?: string | null
  childrenIds?: string[]
}
