/**
 * @file get-user.ts
 * @description Get user operations
 */
import type { User, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Get a user by ID
 */
export async function getUser(store: InMemoryStore, id: string): Promise<Result<User>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const user = store.users.get(id);
  if (!user) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${id}` } };
  }

  return { success: true, data: user };
}

/**
 * Get a user by email
 */
export async function getUserByEmail(store: InMemoryStore, email: string): Promise<Result<User>> {
  if (!email) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email required' } };
  }

  const id = store.userEmails.get(email);
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${email}` } };
  }

  return getUser(store, id);
}

/**
 * Get a user by username
 */
export async function getUserByUsername(store: InMemoryStore, username: string): Promise<Result<User>> {
  if (!username) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Username required' } };
  }

  const id = store.userUsernames.get(username);
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `User not found: ${username}` } };
  }

  return getUser(store, id);
}
