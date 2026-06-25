import { describe, expect, it } from 'vitest';
import {
  validateEnum,
  validateIdentifier,
  validateInteger,
  validateStringParam,
} from './sqlParamValidator';
import type { SqlParameterType } from './featureTypes';

describe('sqlParamValidator', () => {
  describe('validateIdentifier', () => {
    const paramType: SqlParameterType = {
      type: 'identifier',
      description: 'test',
      validation: '^[a-zA-Z_][a-zA-Z0-9_]*$',
      sanitize: 'identifier',
    };

    it('should accept valid identifiers', () => {
      expect(validateIdentifier('users', paramType)).toEqual({
        valid: true,
        sanitized: 'users',
      });
      expect(validateIdentifier('_private', paramType)).toEqual({
        valid: true,
        sanitized: '_private',
      });
      expect(validateIdentifier('my_table_123', paramType)).toEqual({
        valid: true,
        sanitized: 'my_table_123',
      });
    });

    it('should reject identifiers not matching pattern', () => {
      const result = validateIdentifier('123table', paramType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid identifier format');
    });

    it('should reject identifiers with dashes', () => {
      const result = validateIdentifier('my-table', paramType);
      expect(result.valid).toBe(false);
    });

    it('should return error when no validation pattern defined', () => {
      const noPatternType: SqlParameterType = {
        type: 'identifier',
        description: 'test',
        sanitize: 'identifier',
      };
      const result = validateIdentifier('users', noPatternType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No validation pattern defined');
    });
  });

  describe('validateEnum', () => {
    const paramType: SqlParameterType = {
      type: 'enum',
      description: 'test',
      allowedValues: ['ASC', 'DESC', 'NULLS FIRST'],
      sanitize: 'enum',
    };

    it('should accept valid enum values', () => {
      expect(validateEnum('ASC', paramType)).toEqual({
        valid: true,
        sanitized: 'ASC',
      });
      expect(validateEnum('DESC', paramType)).toEqual({
        valid: true,
        sanitized: 'DESC',
      });
    });

    it('should reject invalid enum values', () => {
      const result = validateEnum('INVALID', paramType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid enum value');
      expect(result.error).toContain('ASC');
    });

    it('should return error when no allowed values defined', () => {
      const noValuesType: SqlParameterType = {
        type: 'enum',
        description: 'test',
        sanitize: 'enum',
      };
      const result = validateEnum('ASC', noValuesType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No allowed values defined');
    });
  });

  describe('validateInteger', () => {
    const paramType: SqlParameterType = {
      type: 'integer',
      description: 'test',
      sanitize: 'integer',
      min: 1,
      max: 100,
    };

    it('should accept valid integers within range', () => {
      expect(validateInteger(1, paramType)).toEqual({
        valid: true,
        sanitized: 1,
      });
      expect(validateInteger(50, paramType)).toEqual({
        valid: true,
        sanitized: 50,
      });
      expect(validateInteger(100, paramType)).toEqual({
        valid: true,
        sanitized: 100,
      });
    });

    it('should accept string numbers', () => {
      const result = validateInteger('42', paramType);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(42);
    });

    it('should reject non-integers', () => {
      const result = validateInteger(3.14, paramType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Not an integer');
    });

    it('should reject values below minimum', () => {
      const result = validateInteger(0, paramType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than minimum');
    });

    it('should reject values above maximum', () => {
      const result = validateInteger(101, paramType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should work without min/max constraints', () => {
      const noLimitsType: SqlParameterType = {
        type: 'integer',
        description: 'test',
        sanitize: 'integer',
      };
      expect(validateInteger(9999, noLimitsType)).toEqual({
        valid: true,
        sanitized: 9999,
      });
      expect(validateInteger(-100, noLimitsType)).toEqual({
        valid: true,
        sanitized: -100,
      });
    });
  });

  describe('validateStringParam', () => {
    it('should accept strings without a validation pattern', () => {
      const paramType: SqlParameterType = {
        type: 'string',
        description: 'test',
        sanitize: 'string',
      };
      expect(validateStringParam('any value', paramType)).toEqual({
        valid: true,
        sanitized: 'any value',
      });
    });

    it('should accept strings matching the validation pattern', () => {
      const paramType: SqlParameterType = {
        type: 'string',
        description: 'test',
        sanitize: 'string',
        validation: '^[a-z]+$',
      };
      expect(validateStringParam('hello', paramType)).toEqual({
        valid: true,
        sanitized: 'hello',
      });
    });

    it('should reject strings not matching the validation pattern', () => {
      const paramType: SqlParameterType = {
        type: 'string',
        description: 'test',
        sanitize: 'string',
        validation: '^[a-z]+$',
      };
      const result = validateStringParam('Hello123', paramType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid string format');
    });
  });
});
