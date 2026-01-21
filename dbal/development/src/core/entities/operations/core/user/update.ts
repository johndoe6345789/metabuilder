import type { DBALAdapter } from '../../../../../adapters/adapter'
import { DBALError } from '../../../../../core/foundation/errors'
import type { UpdateUserInput, User } from '../../../../../core/foundation/types'
import { assertValidUserId, assertValidUserUpdate } from './validation'

export const updateUser = async (
  adapter: DBALAdapter,
  id: string,
  data: UpdateUserInput,
): Promise<User> => {
  assertValidUserId(id)
  assertValidUserUpdate(data)

  try {
    return adapter.update('User', id, data as unknown as Record<string, unknown>) as Promise<User>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}
