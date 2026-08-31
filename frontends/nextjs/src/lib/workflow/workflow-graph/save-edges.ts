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
  // GraphEdges says these levels are always present, but the only caller
  // (use-god-workflow.ts) reaches this via `workflow.connections as unknown
  // as GraphEdges` -- a double-unknown cast from @/workflow-editor's own
  // Connection[] (a flat array), not this nested Record<string,
  // Record<string, Record<string, ConnectionTarget[]>>> adjacency shape at
  // all. The declared type doesn't describe what's actually on the wire
  // here, so every level falls back defensively rather than trusting it.
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
