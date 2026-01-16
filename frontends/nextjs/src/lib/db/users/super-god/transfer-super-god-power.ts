/**
 * Transfer SuperGod power from one user to another
 */
import { getDBALClient } from '@/dbal'

export async function transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
  const client = getDBALClient()

  await client.users.update(fromUserId, { isInstanceOwner: false, role: 'god' })
  await client.users.update(toUserId, { isInstanceOwner: true, role: 'supergod' })
}
