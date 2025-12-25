import { prisma } from '../../prisma'

/**
 * Get password change timestamps for all users
 * @returns Record of username to timestamp
 */
export const getPasswordChangeTimestamps = async (): Promise<Record<string, number>> => {
  const users = await prisma.user.findMany({
    where: { passwordChangeTimestamp: { not: null } },
    select: { username: true, passwordChangeTimestamp: true },
  })
  const result: Record<string, number> = {}
  for (const user of users) {
    if (user.passwordChangeTimestamp) {
      result[user.username] = Number(user.passwordChangeTimestamp)
    }
  }
  return result
}
