/**
 * Transfer SuperGod power from one user to another
 */
export async function transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
  const { dbalUpdateUser } = await import('@/lib/database-dbal/users/dbal-update-user.server')
  await dbalUpdateUser(fromUserId, { isInstanceOwner: false, role: 'god' })
  await dbalUpdateUser(toUserId, { isInstanceOwner: true, role: 'supergod' })
}
