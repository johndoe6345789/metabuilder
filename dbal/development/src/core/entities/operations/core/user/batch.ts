import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { User } from '../../../../../core/foundation/types'
import { DBALError } from '../../../../../core/foundation/errors'
import { validateUserCreate, validateUserUpdate } from '../../../../../core/foundation/validation'

export const createManyUsers = async (
  adapter: DBALAdapter,
  data: Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<number> => {
  if (!data || data.length === 0) {
    return 0
  }

  const validationErrors = data.flatMap((item, index) =>
    validateUserCreate(item).map(error => ({ field: `users[${index}]`, error })),
  )
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user batch', validationErrors)
  }

  try {
    return adapter.createMany('User', data as Record<string, unknown>[])
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}

export const updateManyUsers = async (
  adapter: DBALAdapter,
  filter: Record<string, unknown>,
  data: Partial<User>,
): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk update requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  if (!data || Object.keys(data).length === 0) {
    throw DBALError.validationError('Bulk update requires data', [
      { field: 'data', error: 'Update data is required' },
    ])
  }

  const validationErrors = validateUserUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user update data', validationErrors.map(error => ({ field: 'user', error })))
  }

  try {
    return adapter.updateMany('User', filter, data as Record<string, unknown>)
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}

export const deleteManyUsers = async (adapter: DBALAdapter, filter: Record<string, unknown>): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk delete requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  return adapter.deleteMany('User', filter)
}
