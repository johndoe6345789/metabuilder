import { readList } from '@/lib/db/read-list'

/** Deletes every row of one entity belonging to @p workflowId. */
async function clear(
  base: string,
  entity: string,
  workflowId: string
): Promise<void> {
  const q = `?filter.workflowId=${encodeURIComponent(workflowId)}&limit=2000`
  const existing = await fetch(`${base}/${entity}${q}`, { cache: 'no-store' })
  if (!existing.ok) return
  for (const row of readList<{ id: unknown }>(await existing.json())) {
    await fetch(`${base}/${entity}/${String(row.id)}`, { method: 'DELETE' })
  }
}

/**
 * Deletes a workflow's stored graph, so saveGraph writes a clean set
 * rather than a diff.
 *
 * Parameters have to go explicitly. The schema declares
 * `on_delete: cascade` on the param's relation to its node, but only the
 * Prisma generator reads that -- the SQL adapters create no foreign keys,
 * so nothing removes a param when its node is deleted. That went
 * unnoticed for as long as no param row was ever written.
 *
 * Left behind they do not merely accumulate: (nodeId, name, sortOrder) is
 * unique, so re-publishing from the editor -- where a node keeps its id
 * between saves -- would 409 on every parameter and report that the
 * workflow was saved but its steps were not.
 *
 * Params first, so a failure part-way through never leaves a node whose
 * parameters have already gone.
 */
export async function deleteExistingGraph(
  base: string,
  workflowId: string
): Promise<void> {
  await clear(base, 'WorkflowNodeParam', workflowId)
  await clear(base, 'WorkflowNode', workflowId)
  await clear(base, 'WorkflowEdge', workflowId)
}
