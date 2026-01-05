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
    profilePicture: record.profilePicture ? String(record.profilePicture) : undefined,
    bio: record.bio ? String(record.bio) : undefined,
    createdAt: Number(record.createdAt),
    tenantId: record.tenantId ? String(record.tenantId) : undefined,
    isInstanceOwner: Boolean(record.isInstanceOwner),
  }
}
