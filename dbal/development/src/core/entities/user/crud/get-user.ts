/**
 * @file get-user.ts
 * @description Get user operations
 */
import type { Result, User } from '../../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Get a user by ID
 */
export const getUser = async (store: InMemoryStore, id: string): Promise<Result<User>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const user = store.users.get(id)
  if (!user) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${id}` } }
  }

  return { success: true, data: user }
}

/**
 * Get a user by email
 */
export const getUserByEmail = async (store: InMemoryStore, email: string): Promise<Result<User>> => {
  if (!email) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } }
  }

  const id = store.usersByEmail.get(email)
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${email}` } }
  }

  return getUser(store, id)
}

/**
 * Get a user by username
 */
export const getUserByUsername = async (store: InMemoryStore, username: string): Promise<Result<User>> => {
  if (!username) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Username is required' } }
  }

  const id = store.usersByUsername.get(username)
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${username}` } }
  }

  return getUser(store, id)
}
