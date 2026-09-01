import type { GraphNode } from './types'
import { writeValue } from './param-value'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/** Writes each node's row, then its parameter rows -- returns false on
 *  the first failed write rather than partially saving a graph. */
export async function saveNodes(
  base: string,
  tenant: string,
  workflowId: string,
  nodes: GraphNode[]
): Promise<boolean> {
  for (const node of nodes) {
    const nodeId = `${workflowId}__${node.id}`
    const res = await fetch(`${base}/WorkflowNode`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        id: nodeId,
        tenantId: tenant,
        workflowId,
        nodeKey: node.id,
        name: node.name.length > 0 ? node.name : node.id,
        type: node.type,
        // GraphNode says these are always present, but the only caller
        // (use-god-workflow.ts) reaches this via `workflow.nodes as unknown
        // as GraphNode[]` -- a double-unknown cast from @/workflow-editor's
        // own WorkflowNode, which has no typeVersion field at all and a
        // `Position` ({x,y}) rather than a [number, number] tuple. The
        // declared type doesn't describe what's actually on the wire here,
        // so these fall back defensively rather than trusting it.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeVersion: node.typeVersion ?? 1,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        positionX: node.position?.[0] ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        positionY: node.position?.[1] ?? 0,
      }),
    })
    if (!res.ok) return false

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    for (const [name, raw] of Object.entries(node.parameters ?? {})) {
      const { valueType, value } = writeValue(raw)
      const p = await fetch(`${base}/WorkflowNodeParam`, {
        method: 'POST',
        headers: JSON_HEADERS,
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
  return true
}
