import { prisma } from '../../prisma'
import type { User } from '../../../types/level-types'

/**
 * Update a user by ID
 * @param userId - The user ID to update
 * @param updates - Partial user data to update
 */
export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  const data: any = {}
  if (updates.username !== undefined) data.username = updates.username
  if (updates.email !== undefined) data.email = updates.email
  if (updates.role !== undefined) data.role = updates.role
  if (updates.profilePicture !== undefined) data.profilePicture = updates.profilePicture
  if (updates.bio !== undefined) data.bio = updates.bio
  if (updates.tenantId !== undefined) data.tenantId = updates.tenantId
  if (updates.isInstanceOwner !== undefined) data.isInstanceOwner = updates.isInstanceOwner

  await prisma.user.update({
    where: { id: userId },
    data,
  })
}
