import { prisma } from '../prisma'

/**
 * Transfer SuperGod power from one user to another
 */
export async function transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: fromUserId },
      data: { isInstanceOwner: false, role: 'god' },
    }),
    prisma.user.update({
      where: { id: toUserId },
      data: { isInstanceOwner: true, role: 'supergod' },
    }),
  ])
}
