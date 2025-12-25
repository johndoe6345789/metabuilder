import { prisma } from '../prisma'

/**
 * Set or update a user's credential
 */
export async function setCredential(username: string, passwordHash: string): Promise<void> {
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
