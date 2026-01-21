import { describe, expect, it } from 'vitest';
import { areValidIdentifiers, isValidIdentifier } from './DatabaseIdentifierValidation';

describe('DatabaseIdentifierValidation', () => {
  describe('isValidIdentifier', () => {
    it('should accept valid identifiers starting with letter', () => {
      expect(isValidIdentifier('users')).toBe(true);
      expect(isValidIdentifier('my_table')).toBe(true);
      expect(isValidIdentifier('Table123')).toBe(true);
      expect(isValidIdentifier('camelCaseTable')).toBe(true);
    });

    it('should accept valid identifiers starting with underscore', () => {
      expect(isValidIdentifier('_private')).toBe(true);
      expect(isValidIdentifier('_table_name')).toBe(true);
    });

    it('should reject identifiers starting with number', () => {
      expect(isValidIdentifier('123table')).toBe(false);
      expect(isValidIdentifier('1_table')).toBe(false);
    });

    it('should reject identifiers with special characters', () => {
      expect(isValidIdentifier('my-table')).toBe(false);
      expect(isValidIdentifier('table!name')).toBe(false);
      expect(isValidIdentifier('table@name')).toBe(false);
      expect(isValidIdentifier('table name')).toBe(false);
      expect(isValidIdentifier('table;drop')).toBe(false);
    });

    it('should reject empty or null identifiers', () => {
      expect(isValidIdentifier('')).toBe(false);
      expect(isValidIdentifier(null as any)).toBe(false);
      expect(isValidIdentifier(undefined as any)).toBe(false);
    });

    it('should reject identifiers longer than 63 characters', () => {
      const longName = 'a'.repeat(64);
      expect(isValidIdentifier(longName)).toBe(false);
    });

    it('should accept identifiers at the 63 character limit', () => {
      const maxLengthName = 'a'.repeat(63);
      expect(isValidIdentifier(maxLengthName)).toBe(true);
    });

    it('should handle SQL injection attempts', () => {
      expect(isValidIdentifier('table\'; DROP TABLE users--')).toBe(false);
      expect(isValidIdentifier('table/*comment*/')).toBe(false);
      expect(isValidIdentifier('table OR 1=1')).toBe(false);
    });
  });

  describe('areValidIdentifiers', () => {
    it('should return true for all valid identifiers', () => {
      expect(areValidIdentifiers(['users', 'posts', 'comments'])).toBe(true);
      expect(areValidIdentifiers(['_private', 'table_123'])).toBe(true);
    });

    it('should return false if any identifier is invalid', () => {
      expect(areValidIdentifiers(['users', 'invalid-name', 'posts'])).toBe(false);
      expect(areValidIdentifiers(['123table', 'users'])).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(areValidIdentifiers([])).toBe(true);
    });

    it('should return false for array with one invalid identifier', () => {
      expect(areValidIdentifiers(['valid_table', ''])).toBe(false);
      expect(areValidIdentifiers(['table!name'])).toBe(false);
    });
  });
});
