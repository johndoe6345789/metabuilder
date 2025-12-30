import { getScrambledPassword } from '@/lib/auth'
import { Database, hashPassword } from '@/lib/database'
import type { User } from '@/lib/level-types'

export async function initializeUsers() {
  const existingUsers = await Database.getUsers({ scope: 'all' })
  if (existingUsers.length > 0) {
    return
  }

  const users: User[] = [
    {
      id: 'user_supergod',
      username: 'supergod',
      email: 'supergod@metabuilder.local',
      role: 'supergod',
      createdAt: Date.now(),
      isInstanceOwner: true,
    },
    {
      id: 'user_god',
      username: 'god',
      email: 'god@metabuilder.local',
      role: 'god',
      createdAt: Date.now(),
    },
    {
      id: 'user_admin',
      username: 'admin',
      email: 'admin@metabuilder.local',
      role: 'admin',
      createdAt: Date.now(),
    },
    {
      id: 'user_moderator',
      username: 'moderator',
      email: 'moderator@metabuilder.local',
      role: 'moderator',
      createdAt: Date.now(),
    },
    {
      id: 'user_alice',
      username: 'alice',
      email: 'alice@example.com',
      role: 'user',
      createdAt: Date.now(),
    },
    {
      id: 'user_bob',
      username: 'bob',
      email: 'bob@example.com',
      role: 'user',
      createdAt: Date.now(),
    },
  ]

  for (const user of users) {
    const scrambledPassword = getScrambledPassword(user.username)
    const passwordHash = await hashPassword(scrambledPassword)
    await Database.addUser(user)
    await Database.setCredential(user.username, passwordHash)
    await Database.setFirstLoginFlag(user.username, true)
  }

  await Database.setGodCredentialsExpiry(Date.now() + 60 * 60 * 1000)
}
