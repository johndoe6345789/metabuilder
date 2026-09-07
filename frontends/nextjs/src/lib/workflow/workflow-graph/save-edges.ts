import type { Connection } from '@/workflow-editor'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * One WorkflowEdge row per connection the editor holds.
 *
 * The parameter used to be typed as a nested source -> handle -> output
 * -> targets adjacency, which nothing ever passed: the only caller has
 * the editor's flat `Connection[]` and reached this through a
 * double-unknown cast. Object.entries then walked the array, then each
 * connection's own fields, then the characters of their string values, so
 * one link someone drew in the editor became twelve rows with sourceKey
 * "0", handles named "id" and "sourceOutput", and no targetKey at all.
 *
 * It returned true throughout, and the daemon ignores an edge naming a
 * node it does not have, so a workflow still ran -- in whatever order its
 * rows came back, rather than the order that was drawn.
 */
export async function saveEdges(
  base: string,
  tenant: string,
  workflowId: string,
  connections: Connection[]
): Promise<boolean> {
  for (const conn of connections) {
    const handle = conn.sourceOutput === '' ? 'main' : conn.sourceOutput
    const res = await fetch(`${base}/WorkflowEdge`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        // Derived from the pair rather than the connection's own id, so
        // re-saving the same graph reuses the row instead of orphaning it.
        id: `${workflowId}__${conn.sourceNodeId}__${handle}__${conn.targetNodeId}`,
        tenantId: tenant,
        workflowId,
        sourceKey: conn.sourceNodeId,
        targetKey: conn.targetNodeId,
        handle,
        // The editor has one output and one input per step; the columns
        // exist for a future that branches, and a single lane is index 0.
        sourceIndex: 0,
        targetIndex: 0,
      }),
    })
    if (!res.ok) return false
  }
  return true
}
