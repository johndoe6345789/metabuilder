import { prisma } from '../prisma'

export async function deleteComponentConfig(configId: string): Promise<void> {
  await prisma.componentConfig.delete({ where: { id: configId } })
}
