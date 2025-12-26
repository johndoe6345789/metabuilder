import { prisma } from '../prisma'

export async function closeConnection(): Promise<void> {
  await prisma.$disconnect()
}
