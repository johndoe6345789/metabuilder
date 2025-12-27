import { setCredential } from '../../../credentials'
import { hashPassword } from '../../../password/hash-password'
import { getUsers, setUsers } from '../../../users'
import type { User } from '../../../types/level-types'

const buildDefaultUsers = (): User[] => [
  {
    id: 'user_supergod',
    username: 'supergod',
    email: 'supergod@system.local',
    role: 'supergod',
    createdAt: Date.now(),
    isInstanceOwner: true,
  },
  {
    id: 'user_god',
    username: 'god',
    email: 'god@system.local',
    role: 'god',
    createdAt: Date.now(),
    isInstanceOwner: false,
  },
]

export const seedUsers = async () => {
  const users = await getUsers({ scope: 'all' })

  if (users.length === 0) {
    const defaultUsers = buildDefaultUsers()
    await setUsers(defaultUsers)

    for (const user of defaultUsers) {
      const hash = await hashPassword(user.username)
      await setCredential(user.username, hash)
    }
  }
}
