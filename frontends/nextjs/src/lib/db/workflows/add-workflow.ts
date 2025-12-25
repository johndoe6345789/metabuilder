import { prisma } from '../prisma'
import type { Workflow } from '../../level-types'

/**
 * Add a workflow
 */
export async function addWorkflow(workflow: Workflow): Promise<void> {
  await prisma.workflow.create({
    data: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      nodes: JSON.stringify(workflow.nodes),
      edges: JSON.stringify(workflow.edges),
      enabled: workflow.enabled,
    },
  })
}
