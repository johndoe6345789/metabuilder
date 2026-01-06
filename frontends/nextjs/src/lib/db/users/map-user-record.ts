import type { User } from '@/lib/types/level-types'

/**
 * Normalize raw DB records into the shared User shape.
 */
export function mapUserRecord(record: Record<string, unknown>): User {
  return {
    id: String(record.id),
    username: String(record.username),
    email: String(record.email),
    role: record.role as User['role'],
    profilePicture: (record.profilePicture !== null && record.profilePicture !== undefined) ? String(record.profilePicture) : undefined,
    bio: (record.bio !== null && record.bio !== undefined) ? String(record.bio) : undefined,
    createdAt: Number(record.createdAt),
    tenantId: (record.tenantId !== null && record.tenantId !== undefined) ? String(record.tenantId) : undefined,
    isInstanceOwner: Boolean(record.isInstanceOwner),
  }
}
