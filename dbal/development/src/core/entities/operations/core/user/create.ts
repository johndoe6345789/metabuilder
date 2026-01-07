import { randomUUID } from 'crypto'
import type { DBALAdapter } from '../../../../../adapters/adapter'
import { DBALError } from '../../../../../core/foundation/errors'
import type { CreateUserInput, User } from '../../../../../core/foundation/types'
import { assertValidUserCreate } from './validation'

export const createUser = async (
  adapter: DBALAdapter,
  data: CreateUserInput,
): Promise<User> => {
  const now = BigInt(Date.now())
  const payload: User = {
    id: data.id ?? randomUUID(),
    username: data.username,
    email: data.email,
    role: data.role,
    profilePicture: data.profilePicture ?? null,
    bio: data.bio ?? null,
    createdAt: data.createdAt ?? now,
    tenantId: data.tenantId ?? null,
    isInstanceOwner: data.isInstanceOwner ?? false,
    passwordChangeTimestamp: data.passwordChangeTimestamp ?? null,
    firstLogin: data.firstLogin ?? false,
  }
  assertValidUserCreate(payload)

  try {
    return adapter.create('User', payload) as Promise<User>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('User with username or email already exists')
    }
    throw error
  }
}
