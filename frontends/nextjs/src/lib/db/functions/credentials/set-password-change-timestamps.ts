import { prisma } from '../../prisma'

/**
 * Set password change timestamps
 * @param timestamps - Record of username to timestamp
 */
export const setPasswordChangeTimestamps = async (timestamps: Record<string, number>): Promise<void> => {
  for (const [username, timestamp] of Object.entries(timestamps)) {
    await prisma.user.update({
      where: { username },
      data: { passwordChangeTimestamp: BigInt(timestamp) },
    })
  }
}
