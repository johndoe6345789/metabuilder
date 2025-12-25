import { prisma } from '../../prisma'

/**
 * Set or update a credential for a user
 * @param username - The username
 * @param passwordHash - The hashed password
 */
export const setCredential = async (username: string, passwordHash: string): Promise<void> => {
  await prisma.credential.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  })

  await prisma.user.update({
    where: { username },
    data: { passwordChangeTimestamp: BigInt(Date.now()) },
  })
}
