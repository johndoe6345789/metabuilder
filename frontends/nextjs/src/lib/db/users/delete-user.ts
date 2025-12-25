import { prisma } from '../prisma'

/**
 * Delete a user by ID
 */
export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } })
}
