import type { GraphNode, GraphEdges } from './types'
import { deleteExistingGraph } from './delete-existing-graph'
import { saveNodes } from './save-nodes'
import { saveEdges } from './save-edges'

/** Replace a workflow's graph. Rows are deleted first, so this is a set. */
export async function saveGraph(
  dbal: string,
  tenant: string,
  workflowId: string,
  nodes: GraphNode[],
  edges: GraphEdges
): Promise<boolean> {
  const base = `${dbal}/${tenant}/core`

  await deleteExistingGraph(base, workflowId)

  if (!(await saveNodes(base, tenant, workflowId, nodes))) return false
  return saveEdges(base, tenant, workflowId, edges)
}
