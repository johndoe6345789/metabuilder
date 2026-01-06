/**
 * @file delete-user.ts
 * @description Delete user operation
 */
import type { Result } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Delete a user by ID
 */
export const deleteUser = async (store: InMemoryStore, id: string): Promise<Result<boolean>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] ?? 'Invalid ID' } }
  }

  const user = store.users.get(id)
  if (!user) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${id}` } }
  }

  store.users.delete(id)
  store.usersByEmail.delete(user.email)
  store.usersByUsername.delete(user.username)

  return { success: true, data: true }
}
