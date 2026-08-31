export interface TreeNodeShape {
  id: string
  type: string
  props: Record<string, unknown>
  children: TreeNodeShape[]
}

export interface NodeRow {
  id: string
  parentId: string | null
  type: string
  sortOrder: number
}

export interface PropRow {
  nodeId: string
  name: string
  value: string | null
  valueType: string
}
