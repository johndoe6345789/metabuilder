import { prisma } from '../prisma'
import type { Workflow } from '../../level-types'

/**
 * Update a workflow by ID
 */
export async function updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
  const data: any = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.nodes !== undefined) data.nodes = JSON.stringify(updates.nodes)
  if (updates.edges !== undefined) data.edges = JSON.stringify(updates.edges)
  if (updates.enabled !== undefined) data.enabled = updates.enabled

  await prisma.workflow.update({
    where: { id: workflowId },
    data,
  })
}
