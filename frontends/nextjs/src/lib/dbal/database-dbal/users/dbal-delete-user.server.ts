import 'server-only'

import { getDBAL } from './get-dbal.server'

export async function dbalDeleteUser(userId: string): Promise<boolean> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  return await dbal.users.delete(userId)
}
