import { dbalUpdateUser } from '@/lib/dbal/database-dbal/users/dbal-update-user.server'

/**
 * Transfer SuperGod power from one user to another
 */
export async function transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
  await dbalUpdateUser(fromUserId, { isInstanceOwner: false, role: 'god' })
  await dbalUpdateUser(toUserId, { isInstanceOwner: true, role: 'supergod' })
}
