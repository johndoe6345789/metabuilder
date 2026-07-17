export type ComponentNode = {
  id: string
  type: string
  parentId: string | null
  order: number
  pageId: string
  props: Record<string, unknown>
  styles: Record<string, string>
}

export type PropField = {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  options?: string[]
}

export type ComponentDef = {
  type: string
  category: string
  allowsChildren: boolean
  defaultProps: Record<string, unknown>
  propSchema: PropField[]
}
