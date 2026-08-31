import { rowsOf } from './rows-of'

/** Deletes every stored node and edge for a workflow, so saveGraph can
 *  write the new graph as a clean set rather than a diff. Params
 *  cascade with their node, so only WorkflowNode/WorkflowEdge rows
 *  need an explicit delete. */
export async function deleteExistingGraph(
  base: string,
  workflowId: string
): Promise<void> {
  const q = `?filter.workflowId=${encodeURIComponent(workflowId)}&limit=2000`

  const existingNodes = await fetch(`${base}/WorkflowNode${q}`, {
    cache: 'no-store',
  })
  if (existingNodes.ok) {
    for (const row of rowsOf(await existingNodes.json())) {
      await fetch(`${base}/WorkflowNode/${String(row.id)}`, {
        method: 'DELETE',
      })
    }
  }

  const existingEdges = await fetch(`${base}/WorkflowEdge${q}`, {
    cache: 'no-store',
  })
  if (existingEdges.ok) {
    for (const row of rowsOf(await existingEdges.json())) {
      await fetch(`${base}/WorkflowEdge/${String(row.id)}`, {
        method: 'DELETE',
      })
    }
  }
}
