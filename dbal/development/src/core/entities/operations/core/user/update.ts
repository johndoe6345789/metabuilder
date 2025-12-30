import type { DBALAdapter } from '../../../../adapters/adapter'
import { DBALError } from '../../../../foundation/errors'
import type { User } from '../../../../foundation/types'
import { assertValidUserId, assertValidUserUpdate } from './validation'

export const updateUser = async (
  adapter: DBALAdapter,
  id: string,
  data: Partial<User>,
): Promise<User> => {
  assertValidUserId(id)
  assertValidUserUpdate(data)

  try {
    return adapter.update('User', id, data) as Promise<User>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}
