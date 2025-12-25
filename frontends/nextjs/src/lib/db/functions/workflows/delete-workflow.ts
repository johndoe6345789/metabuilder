import { prisma } from '../../prisma'

/**
 * Delete a workflow by ID
 * @param workflowId - The workflow ID
 */
export const deleteWorkflow = async (workflowId: string): Promise<void> => {
  await prisma.workflow.delete({ where: { id: workflowId } })
}
