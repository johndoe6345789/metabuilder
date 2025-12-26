import { prisma } from '../../../config/prisma'

export async function closeConnection(): Promise<void> {
  await prisma.$disconnect()
}
