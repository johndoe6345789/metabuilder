import { prisma } from '../prisma'

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  await prisma.workflow.delete({ where: { id: workflowId } })
}
