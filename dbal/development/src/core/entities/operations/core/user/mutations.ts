import type { DBALAdapter } from '../../../../adapters/adapter'
import type { User } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validateUserCreate, validateUserUpdate, validateId } from '../../../../foundation/validation'

export const createUser = async (
  adapter: DBALAdapter,
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<User> => {
  const validationErrors = validateUserCreate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user data', validationErrors.map(error => ({ field: 'user', error })))
  }

  try {
    return adapter.create('User', data) as Promise<User>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('User with username or email already exists')
    }
    throw error
  }
}

export const updateUser = async (adapter: DBALAdapter, id: string, data: Partial<User>): Promise<User> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    throw DBALError.validationError('Invalid user ID', idErrors.map(error => ({ field: 'id', error })))
  }

  const validationErrors = validateUserUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user update data', validationErrors.map(error => ({ field: 'user', error })))
  }

  try {
    return adapter.update('User', id, data) as Promise<User>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}

export const deleteUser = async (adapter: DBALAdapter, id: string): Promise<boolean> => {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user ID', validationErrors.map(error => ({ field: 'id', error })))
  }

  const result = await adapter.delete('User', id)
  if (!result) {
    throw DBALError.notFound(`User not found: ${id}`)
  }
  return result
}
