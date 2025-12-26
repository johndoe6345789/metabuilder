import { getAdapter } from '../dbal-client'
import type { Workflow } from '../../types/level-types'

/**
 * Update a workflow by ID
 */
export async function updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.nodes !== undefined) data.nodes = JSON.stringify(updates.nodes)
  if (updates.edges !== undefined) data.edges = JSON.stringify(updates.edges)
  if (updates.enabled !== undefined) data.enabled = updates.enabled

  await adapter.update('Workflow', workflowId, data)
}
