export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, unknown>
  styles: Record<string, unknown>
}

export interface ComponentNode {
  id: string
  name: string
  type: string
}

export interface ComponentHierarchy {
  id: string
  parentId?: string | null
  childrenIds?: string[]
}
