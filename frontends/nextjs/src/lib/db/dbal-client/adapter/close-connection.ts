import { prisma } from '../../core/prisma'

export async function closeConnection(): Promise<void> {
  await prisma.$disconnect()
}
