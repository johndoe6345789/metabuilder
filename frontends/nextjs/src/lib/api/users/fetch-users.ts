import type { User } from '@/lib/level-types'
import { requestJson } from '@/lib/api/request-json'

export async function fetchUsers(): Promise<User[]> {
  const payload = await requestJson<{ users: User[]; source?: string }>('/api/users')
  return payload.users
}
