import { prisma } from '../prisma'

export async function deleteComponentNode(nodeId: string): Promise<void> {
  await prisma.componentNode.delete({ where: { id: nodeId } })
}
