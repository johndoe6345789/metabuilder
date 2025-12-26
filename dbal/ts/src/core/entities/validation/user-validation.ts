/**
 * @file user-validation.ts
 * @description User validation functions
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate username format
 */
export function validateUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
