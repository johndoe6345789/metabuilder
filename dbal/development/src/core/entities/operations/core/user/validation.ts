import { DBALError } from '../../../../../core/foundation/errors'
import type { CreateUserInput, UpdateUserInput, User } from '../../../../../core/foundation/types'
import { validateId, validateUserCreate, validateUserUpdate } from '../../../../../core/foundation/validation'

export const assertValidUserId = (id: string): void => {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user ID', validationErrors.map(error => ({ field: 'id', error })))
  }
}

export const assertValidUserCreate = (data: CreateUserInput | User): void => {
  const validationErrors = validateUserCreate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user data', validationErrors.map(error => ({ field: 'user', error })))
  }
}

export const assertValidUserUpdate = (data: UpdateUserInput): void => {
  const validationErrors = validateUserUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user update data', validationErrors.map(error => ({ field: 'user', error })))
  }
}
