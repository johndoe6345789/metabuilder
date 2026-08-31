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
