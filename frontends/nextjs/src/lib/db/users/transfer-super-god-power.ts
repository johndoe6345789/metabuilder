import { getAdapter } from '../dbal-client'

/**
 * Transfer SuperGod power from one user to another
 */
export async function transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('User', fromUserId, { isInstanceOwner: false, role: 'god' })
  await adapter.update('User', toUserId, { isInstanceOwner: true, role: 'supergod' })
}
