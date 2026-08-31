import type { GraphNode, GraphEdges, NodeRow, ParamRow, EdgeRow } from './types'
import { readList } from '@/lib/db/read-list'
import { readValue } from './param-value'

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

  const nodeRows = readList<NodeRow>(await nodeRes.json())
  const paramRows = readList<ParamRow>(await paramRes.json())
  const edgeRows = readList<EdgeRow>(await edgeRes.json())

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
