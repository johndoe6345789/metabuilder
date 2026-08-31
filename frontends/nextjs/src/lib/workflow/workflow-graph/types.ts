export interface GraphNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: Record<string, unknown>
}

/** n8n-style adjacency: source -> handle -> outputIndex -> connections. */
export type GraphEdges = Record<
  string,
  Record<
    string,
    Record<string, { node: string; index: number; type: string }[]>
  >
>

export interface NodeRow {
  id: string
  nodeKey: string
  name: string
  type: string
  // Genuinely optional, not just defensive typing: this is DBAL row data
  // cast via readList<NodeRow>(), so a row from before these columns
  // existed (or written by an older client) can lack them outright.
  typeVersion?: number
  positionX?: number
  positionY?: number
}

export interface ParamRow {
  nodeId: string
  name: string
  value: string | null
  valueType: string
}

export interface EdgeRow {
  sourceKey: string
  targetKey: string
  handle: string
  sourceIndex: number
  targetIndex: number
}
