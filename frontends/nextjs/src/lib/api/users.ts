import { requestJson } from '@/lib/api/request-json'
import type { User, UserRole } from '@/lib/level-types'

export async function listUsers(): Promise<User[]> {
  const payload = await requestJson<{ users: User[] }>('/api/users')
  return payload.users
}

export async function createUser(input: {
  username: string
  email: string
  role?: UserRole
  password: string
  profilePicture?: string
  bio?: string
  tenantId?: string
  isInstanceOwner?: boolean
}): Promise<User> {
  const payload = await requestJson<{ user: User }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return payload.user
}

export async function updateUser(
  userId: string,
  input: {
    email?: string
    role?: UserRole
    password?: string
    profilePicture?: string
    bio?: string
    tenantId?: string
    isInstanceOwner?: boolean
  }
): Promise<User> {
  const payload = await requestJson<{ user: User }>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return payload.user
}

export async function deleteUser(userId: string): Promise<void> {
  await requestJson<{ deleted: boolean }>(`/api/users/${userId}`, {
    method: 'DELETE',
  })
}
