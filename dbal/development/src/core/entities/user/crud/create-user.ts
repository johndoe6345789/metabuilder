/**
 * @file create-user.ts
 * @description Create user operation
 */
import type { CreateUserInput, Result, User } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateUserCreate } from '../../validation/validate-user-create'

/**
 * Create a new user in the store
 */
export const createUser = async (
  store: InMemoryStore,
  input: CreateUserInput
): Promise<Result<User>> => {
  const role = input.role ?? 'user'
  const validationErrors = validateUserCreate({
    username: input.username,
    email: input.email,
    role
  })

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (store.usersByEmail.has(input.email)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Email already exists' } }
  }
  if (store.usersByUsername.has(input.username)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Username already exists' } }
  }

  const user: User = {
    id: store.generateId('user'),
    email: input.email,
    username: input.username,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  store.users.set(user.id, user)
  store.usersByEmail.set(user.email, user.id)
  store.usersByUsername.set(user.username, user.id)

  return { success: true, data: user }
}
