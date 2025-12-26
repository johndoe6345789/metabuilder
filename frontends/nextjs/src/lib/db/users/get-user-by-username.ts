import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

export async function getUserByUsername(
  username: string,
  options?: { tenantId?: string }
): Promise<User | null> {
  const adapter = getAdapter()
  const record = await adapter.findFirst('User', {
    where: {
      username,
      ...(options?.tenantId ? { tenantId: options.tenantId } : {}),
    },
  })

  if (!record) return null

  const user = record as any
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as any,
    profilePicture: user.profilePicture || undefined,
    bio: user.bio || undefined,
    createdAt: Number(user.createdAt),
    tenantId: user.tenantId || undefined,
    isInstanceOwner: user.isInstanceOwner,
  }
}
