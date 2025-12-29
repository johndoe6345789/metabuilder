import { DBALError } from '../../../../foundation/errors'
import type { User } from '../../../../foundation/types'
import { validateId, validateUserCreate, validateUserUpdate } from '../../../../foundation/validation'

export const assertValidUserId = (id: string): void => {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user ID', validationErrors.map(error => ({ field: 'id', error })))
  }
}

export const assertValidUserCreate = (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): void => {
  const validationErrors = validateUserCreate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user data', validationErrors.map(error => ({ field: 'user', error })))
  }
}

export const assertValidUserUpdate = (data: Partial<User>): void => {
  const validationErrors = validateUserUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user update data', validationErrors.map(error => ({ field: 'user', error })))
  }
}
