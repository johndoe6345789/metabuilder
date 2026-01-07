/**
 * @file create-user.ts
 * @description Create user operation
 */
import type { CreateUserInput, Result, User } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateUserCreate } from '../validation/validate-user-create'

/**
 * Create a new user in the store
 */
export const createUser = async (
  store: InMemoryStore,
  input: CreateUserInput
): Promise<Result<User>> => {
  const role = input.role ?? 'user'
  const createdAt = input.createdAt ?? BigInt(Date.now())
  const user: User = {
    id: input.id ?? store.generateId('user'),
    email: input.email,
    username: input.username,
    role,
    profilePicture: input.profilePicture ?? null,
    bio: input.bio ?? null,
    createdAt,
    tenantId: input.tenantId ?? null,
    isInstanceOwner: input.isInstanceOwner ?? false,
    passwordChangeTimestamp: input.passwordChangeTimestamp ?? null,
    firstLogin: input.firstLogin ?? false
  }

  const validationErrors = validateUserCreate(user)

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (store.usersByEmail.has(input.email)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Email already exists' } }
  }
  if (store.usersByUsername.has(input.username)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Username already exists' } }
  }

  store.users.set(user.id, user)
  store.usersByEmail.set(user.email, user.id)
  store.usersByUsername.set(user.username, user.id)

  return { success: true, data: user }
}
