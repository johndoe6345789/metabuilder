import { requestJson } from '@/lib/api/request-json'
import type { User } from '@/lib/level-types'

export async function fetchUsers(): Promise<User[]> {
  const payload = await requestJson<{ users: User[]; source?: string }>('/api/users')
  return payload.users
}
