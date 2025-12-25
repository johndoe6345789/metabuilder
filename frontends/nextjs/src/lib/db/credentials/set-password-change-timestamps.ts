import { prisma } from '../prisma'

/**
 * Set password change timestamps for users
 */
export async function setPasswordChangeTimestamps(timestamps: Record<string, number>): Promise<void> {
  for (const [username, timestamp] of Object.entries(timestamps)) {
    await prisma.user.update({
      where: { username },
      data: { passwordChangeTimestamp: BigInt(timestamp) },
    })
  }
}
