/**
 * @file update-user.ts
 * @description Update user operation
 */
import type { Result, UpdateUserInput, User } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validateUserUpdate } from '../../validation/validate-user-update'

/**
 * Update an existing user
 */
export const updateUser = async (
  store: InMemoryStore,
  id: string,
  input: UpdateUserInput
): Promise<Result<User>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const user = store.users.get(id)
  if (!user) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${id}` } }
  }

  const validationErrors = validateUserUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (input.username && input.username !== user.username) {
    if (store.usersByUsername.has(input.username)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Username already exists' } }
    }
    store.usersByUsername.delete(user.username)
    store.usersByUsername.set(input.username, id)
    user.username = input.username
  }

  if (input.email && input.email !== user.email) {
    if (store.usersByEmail.has(input.email)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Email already exists' } }
    }
    store.usersByEmail.delete(user.email)
    store.usersByEmail.set(input.email, id)
    user.email = input.email
  }

  if (input.role) {
    user.role = input.role
  }

  user.updatedAt = new Date()

  return { success: true, data: user }
}
