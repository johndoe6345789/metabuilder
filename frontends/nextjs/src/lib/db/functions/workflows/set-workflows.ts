import { prisma } from '../../prisma'
import type { Workflow } from '../../../types/level-types'

/**
 * Set all workflows (replaces existing)
 * @param workflows - Array of workflows
 */
export const setWorkflows = async (workflows: Workflow[]): Promise<void> => {
  await prisma.workflow.deleteMany()
  for (const workflow of workflows) {
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
}
