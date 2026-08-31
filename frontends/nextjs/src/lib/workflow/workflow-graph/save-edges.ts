import type { GraphEdges } from './types'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/** Flattens the source -> handle -> outputIndex -> connections adjacency
 *  into one WorkflowEdge row per connection. */
export async function saveEdges(
  base: string,
  tenant: string,
  workflowId: string,
  edges: GraphEdges
): Promise<boolean> {
  for (const [sourceKey, handles] of Object.entries(edges ?? {})) {
    for (const [handle, outputs] of Object.entries(handles ?? {})) {
      for (const [sourceIndex, conns] of Object.entries(outputs ?? {})) {
        for (const conn of conns ?? []) {
          const res = await fetch(`${base}/WorkflowEdge`, {
            method: 'POST',
            headers: JSON_HEADERS,
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
