import type { DBALAdapter } from '../../../../adapters/adapter'
import { DBALError } from '../../../../foundation/errors'
import type { User } from '../../../../foundation/types'
import { assertValidUserCreate } from './validation'

export const createUser = async (
  adapter: DBALAdapter,
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<User> => {
  assertValidUserCreate(data)

  try {
    return adapter.create('User', data) as Promise<User>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('User with username or email already exists')
    }
    throw error
  }
}
