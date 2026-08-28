/**
 * Read and write a workflow's graph as rows.
 *
 * WorkflowNode is one row per step, WorkflowNodeParam one per parameter, and
 * WorkflowEdge one per connection. The in-memory shape the editor and the
 * runner work with is unchanged -- only storage moved, so nothing above this
 * boundary had to learn about rows.
 */

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

interface NodeRow {
  id: string
  nodeKey: string
  name: string
  type: string
  typeVersion: number
  positionX: number
  positionY: number
}

interface ParamRow {
  nodeId: string
  name: string
  value: string | null
  valueType: string
}

interface EdgeRow {
  sourceKey: string
  targetKey: string
  handle: string
  sourceIndex: number
  targetIndex: number
}

function rowsOf(payload: unknown): Record<string, unknown>[] {
  const data = (payload as { data?: { data?: unknown } } | null)?.data?.data
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

function readValue(row: ParamRow): unknown {
  const raw = row.value ?? ''
  if (row.valueType === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }
  if (row.valueType === 'boolean') return raw === 'true'
  return raw
}

function writeValue(value: unknown): {
  valueType: 'string' | 'number' | 'boolean'
  value: string
} {
  if (typeof value === 'boolean') {
    return { valueType: 'boolean', value: value ? 'true' : 'false' }
  }
  if (typeof value === 'number') {
    return { valueType: 'number', value: String(value) }
  }
  if (typeof value === 'string') return { valueType: 'string', value }
  return {
    valueType: 'string',
    value: value == null ? '' : JSON.stringify(value),
  }
}

/** Reassemble a workflow's nodes and connections from its rows. */
export async function loadGraph(
  dbal: string,
  tenant: string,
  workflowId: string,
  signal?: AbortSignal
): Promise<{ nodes: GraphNode[]; edges: GraphEdges }> {
  const base = `${dbal}/${tenant}/core`
  const q = `?filter.workflowId=${encodeURIComponent(workflowId)}&limit=2000`

  const [nodeRes, paramRes, edgeRes] = await Promise.all([
    fetch(`${base}/WorkflowNode${q}`, { signal, cache: 'no-store' }),
    fetch(`${base}/WorkflowNodeParam${q}`, { signal, cache: 'no-store' }),
    fetch(`${base}/WorkflowEdge${q}`, { signal, cache: 'no-store' }),
  ])
  if (!nodeRes.ok || !paramRes.ok || !edgeRes.ok) {
    return { nodes: [], edges: {} }
  }

  const nodeRows = rowsOf(await nodeRes.json()) as unknown as NodeRow[]
  const paramRows = rowsOf(await paramRes.json()) as unknown as ParamRow[]
  const edgeRows = rowsOf(await edgeRes.json()) as unknown as EdgeRow[]

  const paramsByNode = new Map<string, Record<string, unknown>>()
  for (const p of paramRows) {
    const bag = paramsByNode.get(p.nodeId) ?? {}
    bag[p.name] = readValue(p)
    paramsByNode.set(p.nodeId, bag)
  }

  const nodes: GraphNode[] = nodeRows.map(n => ({
    id: n.nodeKey,
    name: n.name,
    type: n.type,
    typeVersion: n.typeVersion ?? 1,
    position: [n.positionX ?? 0, n.positionY ?? 0],
    parameters: paramsByNode.get(n.id) ?? {},
  }))

  const edges: GraphEdges = {}
  for (const e of edgeRows) {
    const handles = (edges[e.sourceKey] ??= {})
    const outputs = (handles[e.handle] ??= {})
    const list = (outputs[String(e.sourceIndex)] ??= [])
    list.push({ node: e.targetKey, index: e.targetIndex, type: e.handle })
  }

  return { nodes, edges }
}

/** Replace a workflow's graph. Rows are deleted first, so this is a set. */
export async function saveGraph(
  dbal: string,
  tenant: string,
  workflowId: string,
  nodes: GraphNode[],
  edges: GraphEdges
): Promise<boolean> {
  const base = `${dbal}/${tenant}/core`
  const json = { 'Content-Type': 'application/json' }

  const existing = await fetch(
    `${base}/WorkflowNode?filter.workflowId=${encodeURIComponent(workflowId)}&limit=2000`,
    { cache: 'no-store' }
  )
  if (existing.ok) {
    for (const row of rowsOf(await existing.json())) {
      // Params cascade with their node.
      await fetch(`${base}/WorkflowNode/${String(row.id)}`, {
        method: 'DELETE',
      })
    }
  }
  const oldEdges = await fetch(
    `${base}/WorkflowEdge?filter.workflowId=${encodeURIComponent(workflowId)}&limit=2000`,
    { cache: 'no-store' }
  )
  if (oldEdges.ok) {
    for (const row of rowsOf(await oldEdges.json())) {
      await fetch(`${base}/WorkflowEdge/${String(row.id)}`, {
        method: 'DELETE',
      })
    }
  }

  for (const node of nodes) {
    const nodeId = `${workflowId}__${node.id}`
    const res = await fetch(`${base}/WorkflowNode`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({
        id: nodeId,
        tenantId: tenant,
        workflowId,
        nodeKey: node.id,
        name: node.name || node.id,
        type: node.type,
        typeVersion: node.typeVersion ?? 1,
        positionX: node.position?.[0] ?? 0,
        positionY: node.position?.[1] ?? 0,
      }),
    })
    if (!res.ok) return false

    for (const [name, raw] of Object.entries(node.parameters ?? {})) {
      const { valueType, value } = writeValue(raw)
      const p = await fetch(`${base}/WorkflowNodeParam`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({
          id: `${nodeId}__${name}`,
          tenantId: tenant,
          nodeId,
          workflowId,
          name,
          value,
          valueType,
        }),
      })
      if (!p.ok) return false
    }
  }

  for (const [sourceKey, handles] of Object.entries(edges ?? {})) {
    for (const [handle, outputs] of Object.entries(handles ?? {})) {
      for (const [sourceIndex, conns] of Object.entries(outputs ?? {})) {
        for (const conn of conns ?? []) {
          const res = await fetch(`${base}/WorkflowEdge`, {
            method: 'POST',
            headers: json,
            body: JSON.stringify({
              id: `${workflowId}__${sourceKey}__${handle}__${sourceIndex}__${conn.node}__${conn.index}`,
              tenantId: tenant,
              workflowId,
              sourceKey,
              targetKey: conn.node,
              handle,
              sourceIndex: Number(sourceIndex),
              targetIndex: conn.index,
            }),
          })
          if (!res.ok) return false
        }
      }
    }
  }
  return true
}
