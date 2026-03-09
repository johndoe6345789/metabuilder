/**
 * Database identifier validation utilities
 *
 * These functions validate SQL identifiers (table names, column names, constraint names)
 * to prevent SQL injection attacks and ensure PostgreSQL naming conventions.
 */

/**
 * Validates if a string is a safe PostgreSQL identifier
 *
 * PostgreSQL identifiers must:
 * - Start with a letter (a-z, A-Z) or underscore (_)
 * - Contain only letters, numbers, and underscores
 * - Be 1-63 characters long (PostgreSQL limit)
 *
 * This validation prevents SQL injection by ensuring only safe characters are used.
 *
 * @param name - The identifier to validate (table name, column name, etc.)
 * @returns true if valid, false otherwise
 *
 * @example
 * isValidIdentifier('my_table') // true
 * isValidIdentifier('users_2024') // true
 * isValidIdentifier('invalid-name!') // false
 * isValidIdentifier('123_table') // false (starts with number)
 */
export function isValidIdentifier(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Check length (PostgreSQL identifier limit is 63 characters)
  if (name.length === 0 || name.length > 63) {
    return false;
  }

  // Must start with letter or underscore, followed by letters, numbers, or underscores
  // Using case-insensitive flag as suggested by linter
  return /^[a-z_]\w*$/i.test(name);
}

/**
 * Validates multiple identifiers at once
 *
 * @param identifiers - Array of identifier strings to validate
 * @returns true if all identifiers are valid, false if any are invalid
 *
 * @example
 * areValidIdentifiers(['table1', 'column_a']) // true
 * areValidIdentifiers(['table1', 'invalid!']) // false
 */
export function areValidIdentifiers(identifiers: string[]): boolean {
  return identifiers.every(id => isValidIdentifier(id));
}
