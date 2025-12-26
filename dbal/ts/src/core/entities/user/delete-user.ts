/**
 * @file delete-user.ts
 * @description Delete user operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Delete a user by ID
 */
export async function deleteUser(store: InMemoryStore, id: string): Promise<Result<boolean>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const user = store.users.get(id);
  if (!user) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${id}` } };
  }

  store.userEmails.delete(user.email);
  store.userUsernames.delete(user.username);
  store.users.delete(id);

  return { success: true, data: true };
}
