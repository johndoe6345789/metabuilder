import { prisma } from '../../prisma'
import type { Workflow } from '../../../types/level-types'

/**
 * Add a single workflow
 * @param workflow - The workflow to add
 */
export const addWorkflow = async (workflow: Workflow): Promise<void> => {
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
