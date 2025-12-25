import { prisma } from '../../prisma'

/**
 * Delete a user by ID
 * @param userId - The user ID to delete
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await prisma.user.delete({ where: { id: userId } })
}
