/**
 * @file create-user.ts
 * @description Create user operation
 */
import type { User, CreateUserInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateEmail, validateUsername } from '../validation/user-validation';

/**
 * Create a new user in the store
 */
export async function createUser(
  store: InMemoryStore,
  input: CreateUserInput
): Promise<Result<User>> {
  if (!validateEmail(input.email)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } };
  }
  if (!validateUsername(input.username)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid username format' } };
  }
  if (input.level < 0 || input.level > 5) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Level must be 0-5' } };
  }

  if (store.userEmails.has(input.email)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Email already exists' } };
  }
  if (store.userUsernames.has(input.username)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Username already exists' } };
  }

  const user: User = {
    id: store.generateId('user'),
    email: input.email,
    username: input.username,
    name: input.name,
    level: input.level,
    isActive: input.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.users.set(user.id, user);
  store.userEmails.set(user.email, user.id);
  store.userUsernames.set(user.username, user.id);

  return { success: true, data: user };
}
