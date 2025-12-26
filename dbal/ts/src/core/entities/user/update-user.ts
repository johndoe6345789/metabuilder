/**
 * @file update-user.ts
 * @description Update user operation
 */
import type { User, UpdateUserInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateEmail, validateUsername } from '../validation/user-validation';

/**
 * Update an existing user
 */
export async function updateUser(
  store: InMemoryStore,
  id: string,
  input: UpdateUserInput
): Promise<Result<User>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const user = store.users.get(id);
  if (!user) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${id}` } };
  }

  if (input.email !== undefined) {
    if (!validateEmail(input.email)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email' } };
    }
    const existingId = store.userEmails.get(input.email);
    if (existingId && existingId !== id) {
      return { success: false, error: { code: 'CONFLICT', message: 'Email exists' } };
    }
    store.userEmails.delete(user.email);
    store.userEmails.set(input.email, id);
    user.email = input.email;
  }

  if (input.username !== undefined) {
    if (!validateUsername(input.username)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid username' } };
    }
    const existingId = store.userUsernames.get(input.username);
    if (existingId && existingId !== id) {
      return { success: false, error: { code: 'CONFLICT', message: 'Username exists' } };
    }
    store.userUsernames.delete(user.username);
    store.userUsernames.set(input.username, id);
    user.username = input.username;
  }

  if (input.name !== undefined) user.name = input.name;
  if (input.level !== undefined) user.level = input.level;
  if (input.isActive !== undefined) user.isActive = input.isActive;

  user.updatedAt = new Date();
  return { success: true, data: user };
}
